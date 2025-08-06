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
import { CompanyRequest, CompanySelected } from '../../models/company.model';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-save-company-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, InputTextModule, ButtonModule, FormsModule, SelectModule],
  templateUrl: './save-company-modal.component.html',
  styles: [],
})
export class SaveCompanyModalComponent {
  // Entradas y salidas
  @Input() visible = false;
  @Input() selectedCompany: CompanySelected | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() companySaved = new EventEmitter<void>();

  // Servicios
  private readonly companyService = inject(CompanyService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Form template
  companyForm: CompanyRequest = {
    name: '',
    legalName: '',
    rfc: '',
    giro: '',
    address: '',
    phone: '',
    secondPhone: '',
    email: '',
  };

  ngOnChanges() {
    if (this.visible) {
      this.initializeForm();
    }
  }

  private initializeForm() {
    if (this.selectedCompany) {
      // Editar
      this.companyForm = {
        name: this.selectedCompany.name,
        legalName: this.selectedCompany.legalName,
        rfc: this.selectedCompany.rfc,
        giro: this.selectedCompany.giro,
        address: this.selectedCompany.address,
        phone: this.selectedCompany.phone,
        secondPhone: this.selectedCompany.secondPhone,
        email: this.selectedCompany.email,
      };
    } else {
      // Crear
      this.companyForm = {
        name: '',
        legalName: '',
        rfc: '',
        giro: '',
        address: '',
        phone: '',
        secondPhone: '',
        email: '',
      };
    }
  }

  onHide() {
    this.closeModal();
  }

  saveCompany() {
    if (this.selectedCompany) {
      this.updateCompany();
    } else {
      this.createCompany();
    }
  }

  private updateCompany() {
    const updateData: CompanyRequest = {
      name: this.companyForm.name,
      legalName: this.companyForm.legalName,
      rfc: this.companyForm.rfc,
      giro: this.companyForm.giro,
      address: this.companyForm.giro,
      phone: this.companyForm.phone,
      secondPhone: this.companyForm.secondPhone,
      email: this.companyForm.email,
    };

    this.companyService
      .updateCompany(this.selectedCompany!.id, updateData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status == 'success') {
            showToastSuccess(this.messageService, 'Empresa actualizada correctamente');
            this.closeModal();
            this.companySaved.emit();
          } else {
            showToastError(this.messageService, 'No se pudo actualizar la empresa');
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo actualizar la empresa');
        },
      });
  }

  private createCompany() {
    const nuevaEmpresa: CompanyRequest = {
      name: this.companyForm.name,
      legalName: this.companyForm.legalName,
      rfc: this.companyForm.rfc,
      giro: this.companyForm.giro,
      address: this.companyForm.giro,
      phone: this.companyForm.phone,
      secondPhone: this.companyForm.secondPhone,
      email: this.companyForm.email,
    };

    this.companyService
      .postCompany(nuevaEmpresa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status == 'success') {
            showToastSuccess(this.messageService, 'Empresa creada correctamente');
            this.closeModal();
            this.companySaved.emit();
          } else {
            showToastError(this.messageService, res.message);
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo crear la empresa');
        },
      });
  }

  private closeModal() {
    this.visibleChange.emit(false);
  }
}
