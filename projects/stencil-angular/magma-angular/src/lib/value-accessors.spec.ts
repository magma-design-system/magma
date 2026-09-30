import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MagmaModule } from '../public-api';

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
      expect(host.text.dirty).toBeTrue();
    });

    it('marks the control as touched on focusout', () => {
      expect(host.text.touched).toBeFalse();

      input.dispatchEvent(new Event('focusout'));

      expect(host.text.touched).toBeTrue();
    });

    it('mirrors the disabled state of the control on the element', () => {
      host.text.disable();
      expect(input.disabled).toBeTrue();

      host.text.enable();
      expect(input.disabled).toBeFalse();
    });
  });

  describe('BooleanValueAccessor on mds-input-switch', () => {
    it('writes the control value to the checked property', () => {
      expect(toggle.checked).toBeTrue();

      host.flag.setValue(false);

      expect(toggle.checked).toBeFalse();
    });

    it('updates the control when the element emits mdsInputSwitchChange', () => {
      toggle.checked = false;
      toggle.dispatchEvent(
        new CustomEvent('mdsInputSwitchChange', {
          detail: { name: '', checked: false, value: '' },
        }),
      );

      expect(host.flag.value).toBeFalse();
    });
  });
});
