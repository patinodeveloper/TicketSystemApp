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
import { UserRequest, UserSelected } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Company } from '../../../companies/models/company.model';
import { CompanyService } from '../../../companies/services/company.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-save-user-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, InputTextModule, ButtonModule, FormsModule, SelectModule, TagModule],
  templateUrl: './save-user-modal.component.html',
  styles: [],
})
export class SaveUserModalComponent {
  // Entradas y salidas
  @Input() visible = false;
  @Input() selectedUser: UserSelected | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() userSaved = new EventEmitter<void>();

  // Servicios
  private readonly userService = inject(UserService);
  private readonly companyService = inject(CompanyService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Form template
  userForm: UserRequest = {
    firstName: '',
    lastName: '',
    secondLastName: '',
    email: '',
    password: '',
    role: '',
    companyId: 0
  };

  // Lista de empresas para el selector
  companies: Company[] = [];
  loadingCompanies = false;

  showPassword = false;

  roles = [
    { label: 'Cliente', value: 'CLIENT' },
    { label: 'Soporte', value: 'SUPPORT' },
    { label: 'Administrador', value: 'ADMIN' }
  ];

  ngOnInit() {
    this.loadCompanies();
  }

  ngOnChanges() {
    if (this.visible) {
      this.initializeForm();
      this.showPassword = false;
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
    if (this.selectedUser) {
      // Editar
      this.userForm = {
        firstName: this.selectedUser.firstName,
        lastName: this.selectedUser.lastName,
        secondLastName: this.selectedUser.secondLastName,
        email: this.selectedUser.email,
        role: this.selectedUser.role,
        companyId: this.selectedUser.company.id,
      };
    } else {
      // Crear
      this.userForm = {
        firstName: '',
        lastName: '',
        secondLastName: '',
        email: '',
        password: '',
        role: '',
        companyId: 0
      };
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('La contraseña debe tener mínimo 6 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    return errors;
  }


  onHide() {
    this.closeModal();
  }

  saveUser() {
    if (!this.selectedUser || (this.selectedUser && this.userForm.password && this.userForm.password.trim())) {
      const password = this.userForm.password || '';
      const passwordErrors = this.validatePassword(password);
      if (passwordErrors.length > 0) {
        passwordErrors.forEach(error => {
          showToastError(this.messageService, error);
        });
        return;
      }
    }

    if (this.selectedUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private updateUser() {
    const updateData: UserRequest = {
      firstName: this.userForm.firstName,
      lastName: this.userForm.lastName,
      secondLastName: this.userForm.secondLastName,
      email: this.userForm.email,
      password: this.userForm.password,
      role: this.userForm.role,
      companyId: this.userForm.companyId,
    };

    this.userService
      .updateUser(this.selectedUser!.id, updateData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status == 'success') {
            showToastSuccess(this.messageService, 'Usuario actualizado correctamente');
            this.closeModal();
            this.userSaved.emit();
          } else {
            showToastError(this.messageService, 'No se pudo actualizar el Usuario');
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo actualizar el Usuario');
        },
      });
  }

  private createUser() {
    const newUser: UserRequest = {
      firstName: this.userForm.firstName,
      lastName: this.userForm.lastName,
      secondLastName: this.userForm.secondLastName,
      email: this.userForm.email,
      password: this.userForm.password,
      role: this.userForm.role,
      companyId: this.userForm.companyId,
    };

    this.userService
      .postUser(newUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status == 'success') {
            showToastSuccess(this.messageService, 'Usuario creado correctamente');
            this.closeModal();
            this.userSaved.emit();
          } else {
            showToastError(this.messageService, res.message);
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo crear el Usuario');
        },
      });
  }

  private closeModal() {
    this.visibleChange.emit(false);
  }
}
