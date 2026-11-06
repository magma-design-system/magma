import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `<div
    style="color: var(--magma-accent)"
    class="bg-[var(--magma-surface-raised)]"
  ></div>`,
  styles: [
    `
      .card {
        border-color: color-mix(in srgb, var(--magma-accent) 50%, transparent);
      }
    `,
  ],
})
export class CardComponent {
  tint = 'rgb(var(--magma-accent) / 0.1)';
  // no markup rule in this jump: a template with ${} is not reported
  badge = `<mds-badge label="${this.label}"></mds-badge>`;

  paint(el: HTMLElement): void {
    el.style.setProperty('--glow', `rgb(var(--magma-accent) / ${this.alpha})`);
  }
}
