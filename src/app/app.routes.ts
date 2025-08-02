import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { HomeComponent } from './core/pages/home/home.component';
import { AUTH_ROUTES } from './core/auth/auth.routes';
import { authGuard, permissionGuard } from './core/auth/guards/auth.guard';
import { TestComponent } from './test/test.component';

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
        title: 'Dashboard - AuthApp',
      },
      {
        path: 'test',
        component: TestComponent,
        canActivate: [permissionGuard(['users.index'])]
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then(r => r.USERS_ROUTES),
        canActivate: [permissionGuard(['users.index'])]
      },
      // {
      //   path: 'roles',
      //   loadChildren: () => import('./features/roles/roles.routes').then(r => r.ROLES_ROUTES),
      //   canActivate: [permissionGuard(['roles.index'])]
      // }
    ],
  },
  {
    path: '**',
    redirectTo: '/auth/login', // Redirige rutas no encontradas al login
  },
];
