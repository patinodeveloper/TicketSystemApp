import { Component, DestroyRef, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { showToastError, showToastSuccess } from '../../../../shared/utils/alerts';
import { SelectModule } from 'primeng/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectRequest, ProjectSelected } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { CompanyService } from '../../../companies/services/company.service';
import { Company } from '../../../companies/models/company.model';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-save-project-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    SelectModule,
    TagModule
  ],
  templateUrl: './save-project-modal.component.html',
  styles: [],
})
export class SaveProjectModalComponent implements OnInit {
  // Entradas y salidas
  @Input() visible = false;
  @Input() selectedProject: ProjectSelected | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() projectSaved = new EventEmitter<void>();

  // Servicios
  private readonly projectService = inject(ProjectService);
  private readonly companyService = inject(CompanyService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Form template
  projectForm: ProjectRequest = {
    name: '',
    description: '',
    companyId: 0,
  };

  // Lista de empresas para el selector
  companies: Company[] = [];
  loadingCompanies = false;

  ngOnInit() {
    this.loadCompanies();
  }

  ngOnChanges() {
    if (this.visible) {
      this.initializeForm();
      // Carga empresas si no están cargadas
      if (this.companies.length === 0) {
        this.loadCompanies();
      }
    }
  }

  private loadCompanies() {
    this.loadingCompanies = true;

    this.companyService
      .getCompanies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            // Filtrar solo empresas activas
            this.companies = response.data.filter(company => company.active);
          }
          this.loadingCompanies = false;
        },
        error: (error) => {
          // console.error('Error cargando empresas:', error);
          showToastError(this.messageService, 'Error al cargar las empresas');
          this.loadingCompanies = false;
        }
      });
  }

  private initializeForm() {
    if (this.selectedProject) {
      // Editar
      this.projectForm = {
        name: this.selectedProject.name,
        description: this.selectedProject.description || '',
        companyId: this.selectedProject.company.id,
      };
    } else {
      // Crear
      this.projectForm = {
        name: '',
        description: '',
        companyId: 0,
      };
    }
  }

  onHide() {
    this.closeModal();
  }

  saveProject() {
    if (this.selectedProject) {
      this.updateProject();
    } else {
      this.createProject();
    }
  }

  private updateProject() {
    const updateData: ProjectRequest = {
      name: this.projectForm.name,
      description: this.projectForm.description,
      companyId: this.projectForm.companyId,
    };

    this.projectService
      .updateProject(this.selectedProject!.id, updateData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            showToastSuccess(this.messageService, 'Proyecto actualizado correctamente');
            this.closeModal();
            this.projectSaved.emit();
          } else {
            showToastError(this.messageService, 'No se pudo actualizar el proyecto');
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo actualizar el proyecto');
        },
      });
  }

  private createProject() {
    const nuevoProyecto: ProjectRequest = {
      name: this.projectForm.name,
      description: this.projectForm.description,
      companyId: this.projectForm.companyId,
    };

    this.projectService
      .postProject(nuevoProyecto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            showToastSuccess(this.messageService, 'Proyecto creado correctamente');
            this.closeModal();
            this.projectSaved.emit();
          } else {
            showToastError(this.messageService, res.message);
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo crear el proyecto');
        },
      });
  }

  private closeModal() {
    this.visibleChange.emit(false);
  }

  // Getter para verificar si el formulario es válido
  get isFormValid(): boolean {
    return !!(this.projectForm.name.trim() && this.projectForm.companyId > 0);
  }
}