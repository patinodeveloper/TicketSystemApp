import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { DeleteResponse, SaveUserResponse, User, UserRequest, UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Signals para el estado de los usuarios
  public readonly users = signal<User[]>([]);
  // Signal para el estado de error
  public readonly error = signal<string | null>(null);

  /**
   * Obtiene los usuarios desde la API
   * @returns Observable con la respuesta del servidor
   */
  getUsers(): Observable<UserResponse> {
    this.error.set(null);

    return this.http.get<UserResponse>(`${this.API_URL}/v1/users`).pipe(
      tap((response) => {
        this.users.set(response.data);
      }),
      catchError((error) => {
        console.error('Error obteniendo los usuarios', error);
        this.error.set(error || 'Error obteniendo los usuarios activos');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Crea un nuevo Usuario
   * @param userData Datos del usuario a registrar
   * @returns Observable con la respuesta del servidor
   */
  postUser(userData: UserRequest): Observable<SaveUserResponse> {
    this.error.set(null);

    return this.http.post<SaveUserResponse>(`${this.API_URL}/v1/users`, userData).pipe(
      catchError((error) => {
        console.error('Error creando el usuario', error);
        this.error.set(error || 'Error al crear el usuario');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Actualiza un usuario existente
   * @param userId ID del usuario a actualizar
   * @param userData Datos del usuario a actualizar
   * @returns Observable con la respuesta del servidor
   */
  updateUser(userId: number, userData: UserRequest): Observable<SaveUserResponse> {
    this.error.set(null);

    return this.http.put<SaveUserResponse>(`${this.API_URL}/v1/users/${userId}`, userData).pipe(
      catchError((error) => {
        console.error('Error actualizando el usuario', error);
        this.error.set(error?.error?.message || 'Error al actualizar el usuario');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Elimina un usuario
   * @param userId ID del usuario a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteUser(userId: number): Observable<DeleteResponse> {
    this.error.set(null);

    return this.http.delete<DeleteResponse>(`${this.API_URL}/v1/users/${userId}`).pipe(
      catchError((error) => {
        console.error('Error eliminando el usuario', error);
        this.error.set(error?.error?.message || 'Error al eliminar el usuario');
        return throwError(() => error);
      }),
    );
  }
}
