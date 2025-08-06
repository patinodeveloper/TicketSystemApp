import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { DeleteResponse, Project, ProjectRequest, ProjectResponse, SaveProjectResponse } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.ApiUrl;

  // Signals para el estado de los proyectos
  public readonly projects = signal<Project[]>([]);
  // Signal para el estado de error
  public readonly error = signal<string | null>(null);

  /**
   * Obtiene los proyectos desde la API
   * @returns Observable con la respuesta del servidor
   */
  getProjects(): Observable<ProjectResponse> {
    this.error.set(null);

    return this.http.get<ProjectResponse>(`${this.API_URL}/v1/projects`).pipe(
      tap((response) => {
        this.projects.set(response.data);
      }),
      catchError((error) => {
        console.error('Error obteniendo los proyectos', error);
        this.error.set(error || 'Error obteniendo las empresas activas');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Crea un nuevo proyecto
   * @param projectData Datos de el proyecto a registrar
   * @returns Observable con la respuesta del servidor
   */
  postProject(projectData: ProjectRequest): Observable<SaveProjectResponse> {
    this.error.set(null);

    return this.http.post<SaveProjectResponse>(`${this.API_URL}/v1/projects`, projectData).pipe(
      catchError((error) => {
        // console.error('Error creando el proyecto', error);
        this.error.set(error || 'Error al crear el proyecto');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Actualiza un proyecto existente
   * @param projectId ID del proyecto a actualizar
   * @param projectData Datos del proyecto a actualizar
   * @returns Observable con la respuesta del servidor
   */
  updateProject(projectId: number, projectData: ProjectRequest): Observable<SaveProjectResponse> {
    this.error.set(null);

    return this.http.put<SaveProjectResponse>(`${this.API_URL}/v1/projects/${projectId}`, projectData).pipe(
      catchError((error) => {
        // console.error('Error actualizando el proyecto', error);
        this.error.set(error?.error?.message || 'Error al actualizar el proyecto');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Elimina un proyecto
   * @param projectId ID del proyecto a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteProject(projectId: number): Observable<DeleteResponse> {
    this.error.set(null);

    return this.http.delete<DeleteResponse>(`${this.API_URL}/v1/projects/${projectId}`).pipe(
      catchError((error) => {
        console.error('Error eliminando el proyecto', error);
        this.error.set(error?.error?.message || 'Error al eliminar el proyecto');
        return throwError(() => error);
      }),
    );
  }
}
