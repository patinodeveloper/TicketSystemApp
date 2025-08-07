import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { DeleteResponse, SaveSupportTypeResponse, SupportType, SupportTypeRequest, SupportTypeResponse } from '../models/support-type.model';

@Injectable({
  providedIn: 'root',
})
export class SupportTypeService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.ApiUrl;

  // Signals para el estado de los tipos de soporte
  public readonly supportTypes = signal<SupportType[]>([]);
  // Signal para el estado de error
  public readonly error = signal<string | null>(null);

  /**
   * Obtiene los tipos de soporte desde la API
   * @returns Observable con la respuesta del servidor
   */
  getSupportTypes(): Observable<SupportTypeResponse> {
    this.error.set(null);

    return this.http.get<SupportTypeResponse>(`${this.API_URL}/v1/support-types`).pipe(
      tap((response) => {
        this.supportTypes.set(response.data);
      }),
      catchError((error) => {
        console.error('Error obteniendo los tipos de soporte', error);
        this.error.set(error || 'Error obteniendo los tipos de soporte');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Crea un nuevo tipo de soporte
   * @param supportTypeData Datos del soporte a registrar
   * @returns Observable con la respuesta del servidor
   */
  postSupportType(supportTypeData: SupportTypeRequest): Observable<SaveSupportTypeResponse> {
    this.error.set(null);

    return this.http.post<SaveSupportTypeResponse>(`${this.API_URL}/v1/support-types`, supportTypeData).pipe(
      catchError((error) => {
        console.error('Error creando el tipo de soporte', error);
        this.error.set(error || 'Error al crear el tipo de soporte');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Actualiza un tipo de soporte existente
   * @param supportTypeId ID del tipo de soporte a actualizar
   * @param supportTypeData Datos del tipo de soporte actualizar
   * @returns Observable con la respuesta del servidor
   */
  updateSupportType(supportTypeId: number, supportTypeData: SupportTypeRequest): Observable<SaveSupportTypeResponse> {
    this.error.set(null);

    return this.http.put<SaveSupportTypeResponse>(`${this.API_URL}/v1/support-types/${supportTypeId}`, supportTypeData).pipe(
      catchError((error) => {
        console.error('Error actualizando el tipo de soporte', error);
        this.error.set(error?.error?.message || 'Error al actualizar el tipo de soporte');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Elimina un tipo de soporte
   * @param supportTypeId ID del tipo de soporte a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteSupportType(supportTypeId: number): Observable<DeleteResponse> {
    this.error.set(null);

    return this.http.delete<DeleteResponse>(`${this.API_URL}/v1/support-types/${supportTypeId}`).pipe(
      catchError((error) => {
        console.error('Error eliminando el tipo de soporte', error);
        this.error.set(error?.error?.message || 'Error al eliminar el tipo de soporte');
        return throwError(() => error);
      }),
    );
  }
}
