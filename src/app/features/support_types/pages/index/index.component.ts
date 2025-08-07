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
import { SaveSupportTypeModalComponent } from '../../modals/save-support-type-modal/save-support-type-modal.component';
import { SupportTypeService } from '../../services/support-type.service';
import { SupportType, SupportTypeSelected } from '../../models/support-type.model';

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
    LoadingSpinnerComponent,
    SaveSupportTypeModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './index.component.html',
  styles: [],
})
export class IndexComponent {
  @ViewChild('dt') dt!: Table;

  private readonly supportTypeService = inject(SupportTypeService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly supportTypes = this.supportTypeService.supportTypes;

  loading = false;
  globalFilter: string = '';
  showModal = false;
  selectedSupportType: SupportTypeSelected | null = null;

  constructor(private messageService: MessageService, private confirmService: ConfirmationService) { }

  ngOnInit(): void {
    this.loadSupportTypes();
  }

  /** Carga los tipos de soporte desde el servicio */
  loadSupportTypes() {
    this.loading = true;
    this.supportTypeService
      .getSupportTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          showToastError(this.messageService, 'Error cargando tipos de soporte');
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  openCreateModal() {
    this.selectedSupportType = null;
    this.showModal = true;
  }

  editSupportType(SupportType: SupportType) {
    if (!this.authService.hasRole('ROLE_ADMIN')) {
      showToastWarning(this.messageService, 'No tienes privilegios para esta acción');
    } else {
      this.selectedSupportType = {
        id: SupportType.id,
        name: SupportType.name,
        description: SupportType.description,
        active: SupportType.active
      };
      this.showModal = true;
    }
  }

  onSupportTypeSaved() {
    this.loadSupportTypes();
  }

  confirmDelete(supportType: SupportType) {
    if (!this.authService.hasRole('ROLE_ADMIN')) {
      showToastWarning(this.messageService, 'No tienes privilegios para esta acción');
    } else {
      const msg = `¿Estás seguro de eliminar a la <span class='text-red-400 font-bold'>${supportType.name}</span>?`;
      showConfirmDialog(this.confirmService, msg, () => this.onDeleteSupportType(supportType));
    }
  }

  onDeleteSupportType(supportType: SupportType) {
    this.supportTypeService
      .deleteSupportType(supportType.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            showToastInfo(this.messageService, 'Soporte eliminado');
            this.loadSupportTypes();
          } else {
            showToastError(this.messageService, res.message || 'Ocurrió un error');
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'Error al eliminar el tipo de soporte');
        },
      });
  }

  // Busca en la tabla de tipos de soporte
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }
}
