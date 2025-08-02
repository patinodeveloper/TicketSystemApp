import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { guestGuard } from './guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'Iniciar Sesión - AuthApp',
  },
];
