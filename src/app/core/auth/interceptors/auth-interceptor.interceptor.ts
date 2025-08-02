import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap, Observable, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RefreshTokenResponse } from '../models/login.interface';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // console.log('🔄 Interceptor ejecutándose para:', req.url);

  // No procesar las rutas de autenticacion
  if (isAuthRoute(req.url)) {
    console.log('🔓 Ruta de autenticación, pasando sin token');
    return next(req);
  }

  // Agregar el token si está disponible
  const authReq = addTokenToRequest(req, authService.accessToken);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('❌ Error interceptado:', error.status, 'en', req.url);

      // Si es 401 y el usuario esta autenticado, intenta hacer el refresh
      if (error.status === 401 && authService.isAuthenticated) {
        return handle401Error(req, next, authService);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Verifica si la URL es una ruta de autenticacion
 */
function isAuthRoute(url: string): boolean {
  const authRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];
  return authRoutes.some(route => url.includes(route));
}

/**
 * Agrega el token Authorization a la peticion
 */
function addTokenToRequest(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (token) {
    // console.log('🔑 Agregando token a la petición');
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // console.log('⚠️ No hay token disponible');
  return request;
}

/**
 * Maneja errores 401 (Unauthorized)
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {

  // console.log('🔄 Manejando error 401...');

  // Si ya estamos refrescando el token esperar
  if (isRefreshing) {
    // console.log('⏳ Ya hay un refresh en progreso, esperando...');
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        // console.log('✅ Token obtenido del refresh en progreso');
        return next(addTokenToRequest(request, token));
      })
    );
  }

  // Inicia el proceso de refresh
  // console.log('🔄 Iniciando proceso de refresh...');
  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshAccessToken().pipe(
    switchMap((refreshResponse: RefreshTokenResponse) => {
      // console.log('✅ Refresh exitoso, reintentando petición original');

      // Refresh exitoso
      isRefreshing = false;
      const newToken = refreshResponse.access_token;
      refreshTokenSubject.next(newToken);

      // Reintenta la peticion original ahora con el nuevo token
      return next(addTokenToRequest(request, newToken));
    }),
    catchError((refreshError) => {
      // console.error('❌ Error en refresh token:', refreshError);

      // Reset del estado de refresh
      isRefreshing = false;
      refreshTokenSubject.next(null);

      // Si el refresh falla, hacer logout y notificar al usuario
      if (refreshError.status === 401) {
        // console.log('🚪 Refresh token expirado, cerrando sesión...');
        authService.logout();

        // Proximamente quiza una notificacion visual
        // console.log('🔔 Notificar al usuario: Sesión expirada');

      }

      // Reenvia el error original
      return throwError(() => refreshError);
    })
  );
}
