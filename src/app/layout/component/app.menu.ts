import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/auth/services/auth.service';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    <ng-container *ngFor="let item of model; let i = index">
      <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
      <li *ngIf="item.separator" class="menu-separator"></li>
    </ng-container>
  </ul> `,
})
export class AppMenu {
  private readonly authService = inject(AuthService);
  private readonly layoutService = inject(LayoutService);

  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }],
      },
      {
        label: 'Gestión',
        items: [
          {
            label: 'Empresas',
            icon: 'pi pi-fw pi-building',
            routerLink: ['/companies'],
          },
          {
            label: 'Proyectos',
            icon: 'pi pi-fw pi-briefcase',
            routerLink: ['/projects'],
          },
          {
            label: 'Usuarios',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/users'],
          },
        ],
      },
      {
        label: 'Soporte',
        items: [
          {
            label: 'Tickets',
            icon: 'pi pi-fw pi-ticket',
            routerLink: ['/tickets'],
          },
          {
            label: 'Tipos de Soporte',
            icon: 'pi pi-fw pi-wrench',
            routerLink: ['/support-types'],
          },
        ],
      },
      {
        label: 'Cuenta',
        items: [
          {
            label: 'Perfil',
            icon: 'pi pi-user',
            routerLink: ['/profile']
          },
          {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            command: () => this.logout(),
          },
        ],
      },
    ];
  }

  /**
   * Ejecuta el logout del usuario
   */
  logout(): void {
    // Limpia la configuracion del layout
    this.layoutService.resetToDefaults();

    // Ejecuta el logout
    this.authService.logout();
  }
}
