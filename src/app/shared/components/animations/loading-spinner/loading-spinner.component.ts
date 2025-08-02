import { Component, Input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  imports: [ProgressSpinnerModule],
  template: `
    <div class="flex justify-center my-6">
      <p-progress-spinner strokeWidth="2">Cargando {{ items }}...</p-progress-spinner>
    </div>
  `,
  styles: ``,
})
export class LoadingSpinnerComponent {
  @Input() items: string = '';
}
