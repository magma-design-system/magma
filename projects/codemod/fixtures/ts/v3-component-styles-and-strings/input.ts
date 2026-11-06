import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `<div
    style="color: rgb(var(--magma-accent))"
    class="bg-[rgb(var(--magma-surface-raised))]"
  ></div>`,
  styles: [
    `
      .card {
        border-color: rgb(var(--magma-accent) / 0.5);
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
