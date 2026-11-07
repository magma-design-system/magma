import { Component } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  template: `<div class="flex gap-md p-lg"></div>`,
  styles: [
    `
      .toolbar {
        max-width: var(--spacing-text);
      }
    `,
  ],
})
export class ToolbarComponent {}
