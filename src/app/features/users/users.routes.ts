import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/guards/auth.guard';
import { IndexComponent } from './pages/index/index.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: IndexComponent,
    canActivate: [permissionGuard],
    data: { permiso: 'user.index' },
  },
];
