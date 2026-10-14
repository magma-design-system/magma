import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MagmaModule } from '../public-api';

// the custom elements build has no componentOnReady(): the host gets the `hydrated` attribute
// (hydratedFlag of stencil.config.ts) after its first render, once its watchers are active
const hydrated = (element: HTMLElement): Promise<void> =>
  vi.waitFor(() => expect(element.hasAttribute('hydrated')).toBe(true));

@Component({
  imports: [MagmaModule, ReactiveFormsModule],
  template: `
    <mds-input [formControl]="text"></mds-input>
    <mds-input-switch [formControl]="flag"></mds-input-switch>
  `,
})
class FormHostComponent {
  readonly text = new FormControl<string | null>('iniziale');
  readonly flag = new FormControl(true, { nonNullable: true });
}

describe('Reactive Forms value accessors', () => {
  let fixture: ComponentFixture<FormHostComponent>;
  let host: FormHostComponent;
  let input: HTMLMdsInputElement;
  let toggle: HTMLMdsInputSwitchElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
    input = fixture.nativeElement.querySelector('mds-input');
    toggle = fixture.nativeElement.querySelector('mds-input-switch');
    await hydrated(input);
    await hydrated(toggle);
  });

  describe('TextValueAccessor on mds-input', () => {
    it('writes the control value to the element', () => {
      expect(input.value).toBe('iniziale');

      host.text.setValue('aggiornato');

      expect(input.value).toBe('aggiornato');
    });

    it('writes an empty string when the control value is null', () => {
      host.text.setValue(null);

      expect(input.value).toBe('');
    });

    it('updates the control when the element emits mdsInputChange', () => {
      input.value = 'digitato';
      input.dispatchEvent(new CustomEvent('mdsInputChange', { detail: { value: 'digitato' } }));

      expect(host.text.value).toBe('digitato');
      expect(host.text.dirty).toBe(true);
    });

    it('marks the control as touched on focusout', () => {
      expect(host.text.touched).toBe(false);

      input.dispatchEvent(new Event('focusout'));

      expect(host.text.touched).toBe(true);
    });

    it('mirrors the disabled state of the control on the element', () => {
      host.text.disable();
      expect(input.disabled).toBe(true);

      host.text.enable();
      expect(input.disabled).toBe(false);
    });
  });

  describe('BooleanValueAccessor on mds-input-switch', () => {
    it('writes the control value to the checked property', () => {
      expect(toggle.checked).toBe(true);

      host.flag.setValue(false);

      // once loaded, the component keeps an unchecked state as undefined, never as false
      expect(toggle.checked).toBeFalsy();
    });

    it('updates the control when the element emits mdsInputSwitchChange', () => {
      toggle.checked = false;
      toggle.dispatchEvent(
        new CustomEvent('mdsInputSwitchChange', {
          detail: { name: '', checked: false, value: '' },
        }),
      );

      // the control mirrors the checked state of the element, which is unchecked
      expect(host.flag.value).toBe(toggle.checked);
      expect(host.flag.value).toBeFalsy();
    });
  });
});
