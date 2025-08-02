import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { HomeComponent } from './core/pages/home/home.component';
import { AUTH_ROUTES } from './core/auth/auth.routes';
import { authGuard, roleGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: AUTH_ROUTES,
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'Dashboard - TicketSystem',
      },
      {
        path: 'companies',
        loadChildren: () => import('./features/companies/companies.routes').then(r => r.COMPANIES_ROUTES),
        canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_CLIENT', 'ROLE_SUPPORT'])]
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/auth/login', // Redirige rutas no encontradas al login
  },
];
