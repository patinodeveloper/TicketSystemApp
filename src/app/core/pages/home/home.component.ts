import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../../../layout/service/layout.service';
import { AuthService } from '../../auth/services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PermissionService } from '../../auth/services/permission.service';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly layoutService = inject(LayoutService);
  readonly authService = inject(AuthService);
  readonly permissionService = inject(PermissionService);

  limpiar(): void {
    this.layoutService.resetToDefaults();
  }

  checkAuthState(): void {
    this.authService.checkAuthStatus();
  }
}
