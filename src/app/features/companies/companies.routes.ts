import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { roleGuard } from '../../core/auth/guards/auth.guard';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    component: IndexComponent,
    canActivate: [roleGuard(['ROLE_ADMIN'])],
  },
];
