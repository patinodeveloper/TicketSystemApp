import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { User, UserSelected } from '../../models/user.model';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { showConfirmDialog, showToastError, showToastInfo, showToastWarning } from '../../../../shared/utils/alerts';
import { SaveUserModalComponent } from '../../modals/save-user-modal/save-user-modal.component';
import { PermissionService } from '../../../../core/auth/services/permission.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/animations/loading-spinner/loading-spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/auth/services/auth.service';

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
    SaveUserModalComponent,
    LoadingSpinnerComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './index.component.html',
  styles: [],
})
export class IndexComponent {
  @ViewChild('dt') dt!: Table;

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  readonly permissionService = inject(PermissionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = this.userService.users;

  loading = false;
  globalFilter: string = '';
  showModal = false;
  selectedUser: UserSelected | null = null;

  constructor(private messageService: MessageService, private confirmService: ConfirmationService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /** Carga los usuarios desde el servicio */
  loadUsers() {
    this.loading = true;
    this.userService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef)) // se destruye automaticamente
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
        username: user.username,
        email: user.email,
        password: '',
        roleIds: user.roles.map((role) => role.id),
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
      const msg = `¿Estás seguro de eliminar a <span class='text-red-400 font-bold'>${user.username}</span>?`;
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
          showToastError(this.messageService, 'Error al eliminar el usuario');
        },
      });
  }

  // Busca en la tabla de usuarios
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }
}
