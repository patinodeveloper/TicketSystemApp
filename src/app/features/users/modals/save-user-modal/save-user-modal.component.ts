import { Component, DestroyRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { UserRequest, UserSelected } from '../../models/user.model';
import { showToastError, showToastSuccess } from '../../../../shared/utils/alerts';
import { SelectModule } from 'primeng/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-save-user-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, InputTextModule, ButtonModule, FormsModule, SelectModule],
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
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  showPassword = false;

  // Form template
  userForm: UserRequest = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    roleIds: [],
  };

  // Opciones de roles
  rolesOptions = [
    { label: 'Administrador', value: 1 },
    { label: 'Usuario', value: 2 },
  ];

  ngOnChanges() {
    if (this.visible) {
      this.initializeForm();
    }
  }

  private initializeForm() {
    if (this.selectedUser) {
      // Editar
      this.userForm = {
        firstName: this.selectedUser.firstName,
        lastName: this.selectedUser.lastName,
        username: this.selectedUser.username,
        email: this.selectedUser.email,
        password: '',
        roleIds: this.selectedUser.roleIds,
      };
    } else {
      // Crear
      this.userForm = {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        roleIds: [],
      };
    }
  }

  togglePasswordView(): void {
    this.showPassword = !this.showPassword;
  }

  onHide() {
    this.closeModal();
  }

  saveUser() {
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
      username: this.userForm.username,
      email: this.userForm.email,
      roleIds: this.userForm.roleIds,
    };

    if (this.userForm.password && this.userForm.password.trim() !== '') {
      updateData.password = this.userForm.password;
    }

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
            showToastError(this.messageService, 'No se pudo actualizar el usuario');
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'No se pudo actualizar el usuario');
        },
      });
  }

  private createUser() {
    const nuevoUsuario: UserRequest = {
      firstName: this.userForm.firstName,
      lastName: this.userForm.lastName,
      username: this.userForm.username,
      email: this.userForm.email,
      password: this.userForm.password,
      roleIds: [Number(this.userForm.roleIds[0])],
    };

    this.userService
      .postUser(nuevoUsuario)
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
          showToastError(this.messageService, 'No se pudo crear el usuario');
        },
      });
  }

  private closeModal() {
    this.visibleChange.emit(false);
  }
}
