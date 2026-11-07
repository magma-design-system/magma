import { Component } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  template: `<div class="flex gap-400 p-600"></div>`,
  styles: [
    `
      .toolbar {
        max-width: var(--container-text);
      }
    `,
  ],
})
export class ToolbarComponent {}
