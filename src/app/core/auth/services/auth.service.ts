import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, EMPTY } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../models/login.interface';
import { AuthState } from '../models/auth-state.interface';
import { User } from '../models/user.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = environment.authApiUrl;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRES_KEY = 'token_expires_at';

  // Tiempo en milisegundos antes de la expiracion para renovar el token (1 minuto)
  private readonly REFRESH_BUFFER_TIME = 1000 * 60 * 1;

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;;
  private isRefreshingToken = false;

  // Estado reactivo usando signals
  private readonly authState = signal<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    tokenExpiresAt: null,
  });

  // Subject para el estado de autenticacion
  private readonly authStateSubject = new BehaviorSubject<AuthState>(this.authState());

  // Getters públicos
  get currentUser(): User | null {
    return this.authState().user;
  }

  get isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  get authState$(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }

  get currentAuthState(): AuthState {
    return this.authState();
  }

  get accessToken(): string | null {
    return this.authState().accessToken;
  }

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa el estado de autenticación al cargar la aplicación
   */
  private initializeAuth(): void {
    const accessToken = this.getStoredAccessToken();
    const refreshToken = this.getStoredRefreshToken();
    const tokenExpiresAt = this.getStoredTokenExpiration();

    if (accessToken && refreshToken && tokenExpiresAt) {
      const user = this.getUserFromToken(accessToken);

      this.updateAuthState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokenExpiresAt,
      });

      // Verifica si el token necesita renovarse
      this.scheduleTokenRefresh();
    }
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.updateAuthState({ ...this.authState(), isLoading: true, error: null });

    return this.http.post<LoginResponse>(`${this.API_URL}/v1/auth/login`, credentials).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
      }),
      catchError((error) => {
        this.updateAuthState({
          ...this.authState(),
          isLoading: false,
          error: this.getErrorMessage(error),
        });
        return throwError(() => error);
      }),
    );
  }

  /**
   * Maneja una respuesta de autenticacion exitosa
   */
  private handleAuthSuccess(response: LoginResponse | RefreshTokenResponse): void {
    const { access_token, refresh_token, expires_in } = response;
    const user = this.getUserFromToken(access_token);
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // Almacena los tokens y tiempo de expiracion
    this.storeTokens(access_token, refresh_token, tokenExpiresAt);

    // Actualiza el estado
    this.updateAuthState({
      user,
      accessToken: access_token,
      refreshToken: refresh_token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      tokenExpiresAt,
    });

    // Programa la renovación automatica
    this.scheduleTokenRefresh();
  }

  /**
   * Renueva el access token usando el refresh token
   */
  refreshAccessToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.authState().refreshToken;

    if (!refreshToken || this.isRefreshingToken) {
      return EMPTY;
    }

    this.isRefreshingToken = true;

    const refreshRequest: RefreshTokenRequest = {
      refresh_token: refreshToken
    };

    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/v1/auth/refresh`, refreshRequest).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isRefreshingToken = false;
      }),
      catchError((error) => {
        this.isRefreshingToken = false;
        console.error('Error renovando token:', error);

        // Si el refresh token ha expirado, hace logout
        if (error.status === 401) {
          this.logout();
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Programa la renovación automatica del token
   */
  private scheduleTokenRefresh(): void {
    // Limpia el timer anterior si existe
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Obtiene el momento de expiracion del token 
    const tokenExpiresAt = this.authState().tokenExpiresAt;
    if (!tokenExpiresAt) return;

    const now = Date.now();
    const expirationTime = tokenExpiresAt.getTime();
    const timeUntilRefresh = expirationTime - now - this.REFRESH_BUFFER_TIME;

    // Si el token necesita renovarse, llama a refresh
    if (timeUntilRefresh <= 0) {
      this.refreshAccessToken().subscribe();
      return;
    }

    // Programa la renovación
    this.refreshTimer = setTimeout(() => {
      if (this.isAuthenticated) {
        this.refreshAccessToken().subscribe();
      }
    }, timeUntilRefresh);

    // Debug para saber los minutos en los que renovara
    // console.log(`Token se renovará en ${Math.round(timeUntilRefresh / 60000)} minutos`);
  }

  /**
   * Verifica si el token necesita renovarse pronto
   */
  shouldRefreshToken(): boolean {
    const tokenExpiresAt = this.authState().tokenExpiresAt;
    if (!tokenExpiresAt) return false;

    const now = Date.now();
    const expirationTime = tokenExpiresAt.getTime();
    const timeUntilExpiration = expirationTime - now;

    return timeUntilExpiration <= this.REFRESH_BUFFER_TIME;
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    // Limpia el timer de renovación
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Limpia el estado
    this.clearAuthState();
  }

  /**
   * Limpia el estado de autenticación y redirige
   */
  private clearAuthState(): void {
    this.removeStoredTokens();
    this.updateAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenExpiresAt: null,
    });
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * Metodo para revisar a detalle el estado de la autenticacion
   */
  checkAuthStatus(): void {
    console.log('🔍 Estado de autenticación:');
    console.log('¿Está autenticado?', this.isAuthenticated);
    console.log('Access Token:', this.accessToken);
    console.log('¿Debe renovar token?', this.shouldRefreshToken());
  }

  // Métodos de almacenamiento
  private getStoredAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getStoredTokenExpiration(): Date | null {
    const stored = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    return stored ? new Date(stored) : null;
  }

  private storeTokens(accessToken: string, refreshToken: string, expiresAt: Date): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toISOString());
  }

  private removeStoredTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  /**
   * Extrae la información del usuario del token JWT
   */
  private getUserFromToken(token: string): User {
    const decoded: JwtPayload = jwtDecode(token);
    return {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      secondLastName: decoded.secondLastName,
      role: decoded.role,
    };
  }

  /**
   * Actualiza el estado de autenticación
   */
  private updateAuthState(newState: AuthState): void {
    this.authState.set(newState);
    this.authStateSubject.next(newState);
  }

  /**
   * Extrae el mensaje de error de la respuesta HTTP
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Ha ocurrido un error inesperado';
  }
}