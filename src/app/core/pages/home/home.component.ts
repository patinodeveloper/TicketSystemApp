import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../../../layout/service/layout.service';
import { AuthService } from '../../auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly layoutService = inject(LayoutService);
  readonly authService = inject(AuthService);

  limpiar(): void {
    this.layoutService.resetToDefaults();
  }

  checkAuthState(): void {
    this.authService.checkAuthStatus();
  }
}
