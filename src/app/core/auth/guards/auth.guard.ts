import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no está autenticado, redirige al login
  if (!authService.isAuthenticated) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Si el token necesita renovarse, intenta renovarlo
  if (authService.shouldRefreshToken()) {
    return authService.refreshAccessToken().pipe(
      map(() => true), // Si se renueva correctamente, permite el acceso
      catchError((error) => {
        console.error('Error renovando token en guard:', error);
        // Si falla la renovacion, redirige al login
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        });
        return of(false);
      })
    );
  }

  return true;
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return true;
  }

  // Redirige al dashboard si ya está autenticado
  router.navigate(['/']);
  return false;
};

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated) {
      router.navigate(['/auth/login']);
      return false;
    }

    // Verifica la renovacion del token si es necesario
    if (authService.shouldRefreshToken()) {
      return authService.refreshAccessToken().pipe(
        map(() => {
          if (authService.hasAnyRole(requiredRoles)) {
            return true;
          }
          router.navigate(['/'], {
            queryParams: { error: 'access-denied' },
          });
          return false;
        }),
        catchError((error) => {
          console.error('Error renovando token en role guard:', error);
          router.navigate(['/auth/login']);
          return of(false);
        })
      );
    }

    if (authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    // Redirige a la pagina de acceso denegado o dashboard
    router.navigate(['/'], {
      queryParams: { error: 'access-denied' },
    });
    return false;
  };
};