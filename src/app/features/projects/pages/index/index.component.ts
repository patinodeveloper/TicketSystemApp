import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { showConfirmDialog, showToastError, showToastInfo, showToastWarning } from '../../../../shared/utils/alerts';
import { LoadingSpinnerComponent } from '../../../../shared/components/animations/loading-spinner/loading-spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { SaveProjectModalComponent } from '../../modals/save-project-modal/save-project-modal.component';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectSelected } from '../../models/project.model';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    SaveProjectModalComponent,
    LoadingSpinnerComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './index.component.html',
  styles: [],
})
export class IndexComponent {
  @ViewChild('dt') dt!: Table;

  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly projects = this.projectService.projects;

  loading = false;
  globalFilter: string = '';
  showModal = false;
  selectedProject: ProjectSelected | null = null;


  ngOnInit(): void {
    this.loadProjects();
  }

  /** Carga los proyectos desde el servicio */
  loadProjects() {
    this.loading = true;
    this.projectService
      .getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef)) // se destruye automaticamente
      .subscribe({
        error: (err) => {
          showToastError(this.messageService, 'Error cargando proyectos');
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  openCreateModal() {
    this.selectedProject = null;
    this.showModal = true;
  }

  editProject(project: Project) {
    if (!this.authService.hasRole('ROLE_ADMIN')) {
      showToastWarning(this.messageService, 'No tienes privilegios para esta acción');
    } else {
      this.selectedProject = {
        id: project.id,
        name: project.name,
        description: project.description,
        company: project.company,
        active: project.active
      };
      this.showModal = true;
    }
  }

  onProjectSaved() {
    this.loadProjects();
  }

  confirmDelete(project: Project) {
    if (!this.authService.hasRole('ROLE_ADMIN')) {
      showToastWarning(this.messageService, 'No tienes privilegios para esta acción');
    } else {
      const msg = `¿Estás seguro de eliminar el proyecto <span class='text-red-400 font-bold'>${project.name}</span>?`;
      showConfirmDialog(this.confirmService, msg, () => this.onDeleteProject(project));
    }
  }

  onDeleteProject(project: Project) {
    this.projectService
      .deleteProject(project.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            showToastInfo(this.messageService, 'Proyecto eliminado');
            this.loadProjects();
          } else {
            showToastError(this.messageService, res.message || 'Ocurrió un error');
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'Error al eliminar el proyecto');
        },
      });
  }

  // Busca en la tabla de proyectos
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }
}
