import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Company, CompanyRequest, CompanyResponse, DeleteResponse, SaveCompanyResponse } from '../models/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.ApiUrl;

  // Signals para el estado de las empresas
  public readonly companies = signal<Company[]>([]);
  // Signal para el estado de error
  public readonly error = signal<string | null>(null);

  /**
   * Obtiene las empresas desde la API
   * @returns Observable con la respuesta del servidor
   */
  getCompanies(): Observable<CompanyResponse> {
    this.error.set(null);

    return this.http.get<CompanyResponse>(`${this.API_URL}/v1/companies`).pipe(
      tap((response) => {
        this.companies.set(response.data);
      }),
      catchError((error) => {
        console.error('Error obteniendo los empresas', error);
        this.error.set(error || 'Error obteniendo las empresas activas');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Crea una nueva empresa
   * @param companyData Datos de la empresa a registrar
   * @returns Observable con la respuesta del servidor
   */
  postCompany(companyData: CompanyRequest): Observable<SaveCompanyResponse> {
    this.error.set(null);

    return this.http.post<SaveCompanyResponse>(`${this.API_URL}/v1/companies`, companyData).pipe(
      catchError((error) => {
        console.error('Error creando la empresa', error);
        this.error.set(error || 'Error al crear la empresa');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Actualiza una empresa existente
   * @param companyId ID de la empresa a actualizar
   * @param companyData Datos de la empresa a actualizar
   * @returns Observable con la respuesta del servidor
   */
  updateCompany(companyId: number, companyData: CompanyRequest): Observable<SaveCompanyResponse> {
    this.error.set(null);

    return this.http.put<SaveCompanyResponse>(`${this.API_URL}/v1/companies/${companyId}`, companyData).pipe(
      catchError((error) => {
        console.error('Error actualizando la empresa', error);
        this.error.set(error?.error?.message || 'Error al actualizar la empresa');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Elimina una empresa
   * @param companyId ID de la empresa a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteCompany(companyId: number): Observable<DeleteResponse> {
    this.error.set(null);

    return this.http.delete<DeleteResponse>(`${this.API_URL}/v1/companies/${companyId}`).pipe(
      catchError((error) => {
        console.error('Error eliminando la empresa', error);
        this.error.set(error?.error?.message || 'Error al eliminar la empresa');
        return throwError(() => error);
      }),
    );
  }
}
