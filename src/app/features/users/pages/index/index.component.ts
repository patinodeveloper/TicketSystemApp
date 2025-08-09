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
import { SaveUserModalComponent } from '../../modals/save-user-modal/save-user-modal.component';
import { UserService } from '../../services/user.service';
import { User, UserSelected } from '../../models/user.model';

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
    SaveUserModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './index.component.html',
  styles: [],
})
export class IndexComponent {
  @ViewChild('dt') dt!: Table;

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);

  readonly users = this.userService.users;

  loading = false;
  globalFilter: string = '';
  showModal = false;
  selectedUser: UserSelected | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  /** Carga los usuarios desde el servicio */
  private loadUsers() {
    this.loading = true;
    this.userService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          showToastError(this.messageService, 'Error cargando usuarios');
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  openCreateModal() {
    this.selectedUser = null;
    this.showModal = true;
  }

  editUser(user: User) {
    if (!this.authService.hasRole('ROLE_ADMIN')) {
      showToastWarning(this.messageService, 'No tienes privilegios para esta acción');
    } else {
      this.selectedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        secondLastName: user.secondLastName,
        email: user.email,
        role: user.role,
        company: user.company,
        active: user.active
      };
      this.showModal = true;
    }
  }

  onUserSaved() {
    this.loadUsers();
  }

  confirmDelete(user: User) {
    if (!this.authService.hasRole('ROLE_ADMIN')) {
      showToastWarning(this.messageService, 'No tienes privilegios para esta acción');
    } else {
      const msg = `¿Estás seguro de eliminar al usuario <span class='text-red-400 font-bold'>${user.firstName} ${user.lastName}</span>?`;
      showConfirmDialog(this.confirmService, msg, () => this.onDeleteUser(user));
    }
  }

  onDeleteUser(user: User) {
    this.userService
      .deleteUser(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            showToastInfo(this.messageService, 'Usuario eliminado');
            this.loadUsers();
          } else {
            showToastError(this.messageService, res.message || 'Ocurrió un error');
          }
        },
        error: (err) => {
          showToastError(this.messageService, 'Error al eliminar el Usuario');
        },
      });
  }

  /** Aplica un color a la p-tag segun el rol */
  getSeverityByRole(role: string): 'danger' | 'info' | 'success' | 'secondary' {
    switch (role) {
      case 'ADMIN':
        return 'danger'
      case 'SUPPORT':
        return 'info'
      case 'CLIENT':
        return 'success'
      default:
        return 'secondary';
    }
  }

  /** Traduce el ROLE_NAME a una manera mas intuitiva */
  getRole(role: string) {
    switch (role) {
      case 'ADMIN':
        return 'Administrador'
      case 'SUPPORT':
        return 'Soporte'
      case 'CLIENT':
        return 'Cliente'
      default:
        return role;
    }
  }

  // Busca en la tabla de usuarios
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }
}
