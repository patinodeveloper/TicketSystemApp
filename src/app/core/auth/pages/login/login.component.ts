import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    RippleModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent {
  // Servicios
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals para el estado del componente
  protected readonly formData = signal<LoginRequest>({
    username: '',
    password: '',
  });

  protected readonly rememberMe = signal<boolean>(false);
  // Signals de estado
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Getter para obtener la URL de retorno
  private get returnUrl(): string {
    return this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  /**
   * Maneja el envío del form del login
   */
  protected onSubmit(): void {
    // Limpia los errores anteriores
    this.errorMessage.set(null);

    // Valida que los campos no estén vacíos
    const { username, password } = this.formData();
    if (!username.trim() || !password.trim()) {
      this.errorMessage.set('Por favor, completa todos los campos');
      return;
    }

    // Activa el estado de carga
    this.isLoading.set(true);

    // Realiza el login
    this.authService.login(this.formData()).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Redirige a la URL de retorno o dashboard
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.',
        );
      },
    });
  }

  /**
   * Actualiza el campo username
   */
  protected updateUsername(value: string): void {
    this.formData.update((data) => ({ ...data, username: value }));
  }

  /**
   * Actualiza el campo password
   */
  protected updatePassword(value: string): void {
    this.formData.update((data) => ({ ...data, password: value }));
  }

  /**
   * Maneja el cambio en el checkbox "Recordarme"
   */
  protected onRememberMeChange(checked: boolean): void {
    this.rememberMe.set(checked);
    // Pendiente
    console.log('Aun no se como funcionará');

  }

  /**
   * Navega a la pagina de recuperacion de contraseña
   */
  protected onForgotPassword(): void {
    // Pendiente
    // this.router.navigate(['/auth/forgot-password']);
    console.log('Recuperar password');
  }

  /**
   * Verifica si el formulario es válido
   */
  protected get isFormValid(): boolean {
    const { username, password } = this.formData();
    return username.trim().length > 0 && password.trim().length > 0;
  }
}
