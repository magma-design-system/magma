import { Component, reflectComponentType, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DIRECTIVES, MagmaModule } from '../public-api';

@Component({
  imports: [MagmaModule],
  template: `
    <mds-button [label]="label" [disabled]="disabled">Salva</mds-button>
    <mds-input-switch (mdsInputSwitchChange)="events.push($event)"></mds-input-switch>
  `,
})
class HostComponent {
  label = 'Salva';
  disabled = false;
  events: Event[] = [];
}

describe('MagmaModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  it('registers the custom element of every generated proxy', () => {
    expect(DIRECTIVES.length).toBeGreaterThan(0);

    for (const proxy of DIRECTIVES) {
      const selector = reflectComponentType(proxy as Type<unknown>)?.selector ?? '';

      expect(selector).withContext(proxy.name).toMatch(/^mds-/);
      expect(customElements.get(selector)).withContext(selector).toBeDefined();
    }
  });

  it('forwards the Angular inputs to the custom element properties', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLMdsButtonElement = fixture.nativeElement.querySelector('mds-button');

    expect(button.label).toBe('Salva');
    expect(button.disabled).toBeFalse();

    fixture.componentInstance.label = 'Invia';
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    expect(button.label).toBe('Invia');
    expect(button.disabled).toBeTrue();
  });

  it('delivers the custom element events to the template listeners', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const toggle: HTMLMdsInputSwitchElement =
      fixture.nativeElement.querySelector('mds-input-switch');
    const event = new CustomEvent('mdsInputSwitchChange', {
      detail: { name: '', checked: true, value: '' },
    });

    toggle.dispatchEvent(event);

    expect(fixture.componentInstance.events).toEqual([event]);
  });

  it('keeps forRoot() as a provider-less alias for backwards compatibility', () => {
    expect(MagmaModule.forRoot()).toEqual({ ngModule: MagmaModule, providers: [] });
  });
});
