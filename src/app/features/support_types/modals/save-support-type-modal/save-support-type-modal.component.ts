import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { showToastError, showToastSuccess } from '../../../../shared/utils/alerts';
import { SelectModule } from 'primeng/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupportTypeRequest, SupportTypeSelected } from '../../models/support-type.model';
import { SupportTypeService } from '../../services/support-type.service';

@Component({
  selector: 'app-save-support-type-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, InputTextModule, ButtonModule, FormsModule, SelectModule],
  templateUrl: './save-support-type-modal.component.html',
  styles: [],
})
export class SaveSupportTypeModalComponent {
  // Entradas y salidas
  @Input() visible = false;
  @Input() selectedSupportType: SupportTypeSelected | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() supportTypeSaved = new EventEmitter<void>();

  // Servicios
  private readonly supportTypeService = inject(SupportTypeService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Form template
  supportTypeForm: SupportTypeRequest = {
    name: '',
    description: '',
  };

  ngOnChanges() {
    if (this.visible) {
      this.initializeForm();
    }
  }

  private initializeForm() {
    if (this.selectedSupportType) {
      // Editar
      this.supportTypeForm = {
        name: this.selectedSupportType.name,
        description: this.selectedSupportType.description,
      };
    } else {
      // Crear
      this.supportTypeForm = {
        name: '',
        description: '',
      };
    }
  }

  onHide() {
    this.closeModal();
  }

  saveSupportType() {
    if (this.selectedSupportType) {
      this.updateSupportType();
    } else {
      this.createSupportType();
    }
  }

  private updateSupportType() {
    const updateData: SupportTypeRequest = {
      name: this.supportTypeForm.name,
      description: this.supportTypeForm.description,
    };

    this.supportTypeService
      .updateSupportType(this.selectedSupportType!.id, updateData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status == 'success') {
            showToastSuccess(this.messageService, 'Soporte actualizado correctamente');
            this.closeModal();
            this.supportTypeSaved.emit();
          } else {
            showToastError(this.messageService, 'No se pudo actualizar el Soporte');
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo actualizar el Soporte');
        },
      });
  }

  private createSupportType() {
    const newSupport: SupportTypeRequest = {
      name: this.supportTypeForm.name,
      description: this.supportTypeForm.description,
    };

    this.supportTypeService
      .postSupportType(newSupport)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status == 'success') {
            showToastSuccess(this.messageService, 'Soporte creado correctamente');
            this.closeModal();
            this.supportTypeSaved.emit();
          } else {
            showToastError(this.messageService, res.message);
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo crear el Tipo de Soporte');
        },
      });
  }

  private closeModal() {
    this.visibleChange.emit(false);
  }
}
