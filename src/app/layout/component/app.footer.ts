import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Sistema de Tickets by
        <a href="https://github.com/patinodeveloper" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">patinodeveloper</a>
    </div>`
})
export class AppFooter {}
