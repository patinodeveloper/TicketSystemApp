import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError, of, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface PermissionApiResponse {
  status: 'success' | 'error';
  message: string;
  data: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Signals reactivas
  private readonly _permissions = signal<string[]>([]);
  private readonly _permissionsLoaded = signal(false);

  // Acceso público (readonly)
  readonly permissions = this._permissions.asReadonly();
  readonly permissionsLoaded = this._permissionsLoaded.asReadonly();

  /**
   * Obtiene los permisos del usuario desde la API
   */
  getUserPermissions(): Observable<string[]> {
    return this.http.get<PermissionApiResponse>(`${this.apiUrl}/v1/permissions/user/me`).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message);
        }
        return response.data;
      }),
      tap(permissions => {
        this.setPermissions(permissions);
        // Debug
        // console.log('Permisos cargados:', permissions);
      }),
      catchError(error => {
        console.error('Error obteniendo permisos:', error);
        this.clearPermissions();
        return of([]);
      })
    );
  }

  /**
   * Carga los permisos si no están cargados
   */
  loadPermissionsIfNeeded(): Observable<string[]> {
    if (this._permissionsLoaded()) {
      return of(this._permissions());
    }
    return this.getUserPermissions();
  }

  /**
   * Establece los permisos en memoria
   */
  setPermissions(perms: string[]): void {
    this._permissions.set([...perms]);
    this._permissionsLoaded.set(true);
  }

  /**
   * Limpia los permisos
   */
  clearPermissions(): void {
    this._permissions.set([]);
    this._permissionsLoaded.set(false);
  }

  /**
   * Devuelve todos los permisos
   */
  getPermissions(): string[] {
    return [...this._permissions()];
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    return this._permissions().includes(permission);
  }

  /**
   * Computed signal para usar en plantillas reactivas
   */
  hasPermissionSignal(permission: string) {
    return computed(() => this._permissions().includes(permission));
  }

  /**
   * Verifica si tiene alguno de los permisos
   */
  hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => this._permissions().includes(p));
  }

  /**
   * Verifica si tiene todos los permisos
   */
  hasAllPermissions(perms: string[]): boolean {
    return perms.every(p => this._permissions().includes(p));
  }
}
