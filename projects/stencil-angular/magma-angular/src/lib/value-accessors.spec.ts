import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { BooleanValueAccessor, MagmaModule, RadioValueAccessor } from '../public-api';

// the custom elements build has no componentOnReady(): the host gets the `hydrated` attribute
// (hydratedFlag of stencil.config.ts) after its first render, once its watchers are active
const hydrated = (element: HTMLElement): Promise<void> =>
  vi.waitFor(() => expect(element.hasAttribute('hydrated')).toBe(true));

type FormElement = HTMLElement & { disabled?: boolean };

/** The native control a component renders in its shadow root. */
const nativeControl = <T extends HTMLInputElement | HTMLSelectElement>(
  element: HTMLElement,
  selector: string,
): T => {
  const control = element.shadowRoot?.querySelector<T>(selector);
  if (control == null) throw new Error(`no ${selector} in the shadow root of ${element.tagName}`);
  return control;
};

/** Types into the native control, as a user does: the component takes the value and emits. */
const typeInto = (control: HTMLInputElement | HTMLSelectElement, value: string): void => {
  control.value = value;
  control.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
};

/**
 * Clicks the native checkbox or radio once the component has rendered its `checked` state: the
 * render that follows a change by code is asynchronous, and a user clicks what is on screen.
 */
const clickRendered = async (element: HTMLMdsInputSwitchElement): Promise<void> => {
  const control = nativeControl<HTMLInputElement>(element, 'input');
  await vi.waitFor(() => expect(control.checked).toBe(!!element.checked));
  control.click();
};

/**
 * setDisabledState sets the `disabled` prop, which reflects to the attribute: in a browser the
 * attribute calls formDisabledCallback too, as a disabled fieldset does, and both reach
 * isDisabled(), which turns the native control off. jsdom has no form-associated callbacks, so the
 * prop, the attribute and the native control are what can be checked here.
 */
const expectDisabled = async (
  element: FormElement,
  selector: string,
  disabled: boolean,
): Promise<void> => {
  expect(!!element.disabled).toBe(disabled);
  await vi.waitFor(() => {
    expect(element.hasAttribute('disabled')).toBe(disabled);
    expect(nativeControl(element, selector).disabled).toBe(disabled);
  });
};

@Component({
  imports: [MagmaModule, ReactiveFormsModule],
  template: `
    <mds-input [formControl]="text"></mds-input>
    <mds-input type="number" [formControl]="digits"></mds-input>
    <mds-input-date [formControl]="date"></mds-input-date>
    <mds-input-select [formControl]="choice">
      <option value="a">A</option>
      <option value="b">B</option>
      <option value="c">C</option>
    </mds-input-select>
    <mds-input-range [min]="0" [max]="10" [formControl]="amount"></mds-input-range>
    <mds-input-switch [formControl]="flag"></mds-input-switch>
    <mds-input-switch type="checkbox" [formControl]="agree"></mds-input-switch>
    <mds-input-switch type="radio" name="size" value="s" [formControl]="size"></mds-input-switch>
    <mds-input-switch type="radio" name="size" value="m" [formControl]="size"></mds-input-switch>
    <mds-input-switch type="radio" name="size" value="l" [formControl]="size"></mds-input-switch>
  `,
})
class FormHostComponent {
  readonly text = new FormControl<string | null>('iniziale');
  readonly digits = new FormControl<string | null>('');
  readonly date = new FormControl<string | null>('2026-11-10');
  readonly choice = new FormControl<string | null>('b');
  readonly amount = new FormControl<number | null>(4);
  readonly flag = new FormControl(true, { nonNullable: true });
  readonly agree = new FormControl(false, { nonNullable: true });
  readonly size = new FormControl<string | null>('m');
}

describe('Reactive Forms value accessors', () => {
  let fixture: ComponentFixture<FormHostComponent>;
  let host: FormHostComponent;
  const element = <T extends HTMLElement>(selector: string): T =>
    fixture.nativeElement.querySelector(selector) as T;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
    await Promise.all(
      Array.from(fixture.nativeElement.children as HTMLCollectionOf<HTMLElement>).map(hydrated),
    );
  });

  describe('TextValueAccessor on mds-input', () => {
    let input: HTMLMdsInputElement;

    beforeEach(() => {
      input = element('mds-input:not([type=number])');
    });

    it('writes the control value to the element', () => {
      expect(input.value).toBe('iniziale');

      host.text.setValue('aggiornato');

      expect(input.value).toBe('aggiornato');
    });

    it('writes an empty string when the control value is null', () => {
      host.text.setValue(null);

      expect(input.value).toBe('');
    });

    it('leaves the control pristine when it writes the value, though the element emits', async () => {
      host.text.setValue('dal codice');
      await vi.waitFor(() => expect(nativeControl(input, 'input').value).toBe('dal codice'));

      expect(host.text.value).toBe('dal codice');
      expect(host.text.dirty).toBe(false);
    });

    it('updates the control when the user types into the element', async () => {
      typeInto(nativeControl(input, 'input'), 'digitato');

      await vi.waitFor(() => expect(host.text.value).toBe('digitato'));
      expect(host.text.dirty).toBe(true);
    });

    it('marks the control as touched on focusout', () => {
      expect(host.text.touched).toBe(false);

      input.dispatchEvent(new Event('focusout'));

      expect(host.text.touched).toBe(true);
    });

    it('turns the element and its native input off and on with the control', async () => {
      host.text.disable();
      await expectDisabled(input, 'input', true);

      host.text.enable();
      await expectDisabled(input, 'input', false);
    });

    it('keeps a string with type="number", as the value prop of mds-input', async () => {
      const number = element<HTMLMdsInputElement>('mds-input[type=number]');

      typeInto(nativeControl(number, 'input'), '42');

      await vi.waitFor(() => expect(host.digits.value).toBe('42'));
    });
  });

  describe('TextValueAccessor on mds-input-date', () => {
    let date: HTMLMdsInputDateElement;

    beforeEach(() => {
      date = element('mds-input-date');
    });

    it('writes the control value to the element', () => {
      expect(date.value).toBe('2026-11-10');

      host.date.setValue('2026-12-25');

      expect(date.value).toBe('2026-12-25');
      expect(host.date.dirty).toBe(false);
    });

    it('updates the control when the selected date changes', async () => {
      // a pick in the calendar sets value, which emits mdsInputDateSelect
      await date.setValue('2027-01-15');

      await vi.waitFor(() => expect(host.date.value).toBe('2027-01-15'));
    });

    it('turns the element and its native input off and on with the control', async () => {
      host.date.disable();
      await expectDisabled(date, 'input', true);

      host.date.enable();
      await expectDisabled(date, 'input', false);
    });
  });

  describe('SelectValueAccessor on mds-input-select', () => {
    let select: HTMLMdsInputSelectElement;

    beforeEach(() => {
      select = element('mds-input-select');
    });

    it('writes the control value to the element and selects its option', async () => {
      expect(select.value).toBe('b');

      host.choice.setValue('c');

      expect(select.value).toBe('c');
      await vi.waitFor(() =>
        expect(nativeControl<HTMLSelectElement>(select, 'select').value).toBe('c'),
      );
    });

    it('updates the control when the user picks an option', async () => {
      typeInto(nativeControl(select, 'select'), 'a');

      await vi.waitFor(() => expect(host.choice.value).toBe('a'));
      expect(host.choice.dirty).toBe(true);
    });

    it('turns the element and its native select off and on with the control', async () => {
      host.choice.disable();
      await expectDisabled(select, 'select', true);

      host.choice.enable();
      await expectDisabled(select, 'select', false);
    });
  });

  describe('NumericValueAccessor on mds-input-range', () => {
    let range: HTMLMdsInputRangeElement;

    beforeEach(() => {
      range = element('mds-input-range');
    });

    it('writes the control value to the element', () => {
      expect(range.value).toBe(4);

      host.amount.setValue(7);

      expect(range.value).toBe(7);
    });

    it('updates the control with a number when the user moves the thumb', async () => {
      typeInto(nativeControl(range, 'input'), '9');

      await vi.waitFor(() => expect(host.amount.value).toBe(9));
      expect(host.amount.dirty).toBe(true);
    });

    it('holds the midpoint after reset(), as a range always holds a number', async () => {
      // writeValue turns null into '', the component sanitizes it as a native range does and
      // emits the result, which reaches the control as a change
      host.amount.reset();

      await vi.waitFor(() => expect(host.amount.value).toBe(5));
      expect(range.value).toBe(5);
      expect(host.amount.dirty).toBe(true);
    });

    it('turns the element and its native input off and on with the control', async () => {
      host.amount.disable();
      await expectDisabled(range, 'input', true);

      host.amount.enable();
      await expectDisabled(range, 'input', false);
    });
  });

  describe('BooleanValueAccessor on mds-input-switch', () => {
    let toggle: HTMLMdsInputSwitchElement;
    let checkbox: HTMLMdsInputSwitchElement;

    beforeEach(() => {
      toggle = element('mds-input-switch[type=switch]');
      checkbox = element('mds-input-switch[type=checkbox]');
    });

    it('writes the control value to the checked property', () => {
      expect(toggle.checked).toBe(true);

      host.flag.setValue(false);

      // once loaded, the component keeps an unchecked state as undefined, never as false
      expect(toggle.checked).toBeFalsy();
    });

    it('updates the control when the user toggles the switch', async () => {
      await clickRendered(toggle);

      await vi.waitFor(() => expect(host.flag.value).toBeFalsy());
      expect(host.flag.dirty).toBe(true);
    });

    it('binds a checkbox the same way', async () => {
      host.agree.setValue(true);
      expect(checkbox.checked).toBe(true);

      await clickRendered(checkbox);

      await vi.waitFor(() => expect(host.agree.value).toBeFalsy());
    });

    it('turns the element and its native input off and on with the control', async () => {
      host.flag.disable();
      await expectDisabled(toggle, 'input', true);

      host.flag.enable();
      await expectDisabled(toggle, 'input', false);
    });
  });

  describe('RadioValueAccessor on mds-input-switch type="radio"', () => {
    let radios: HTMLMdsInputSwitchElement[];
    const radio = (value: string): HTMLMdsInputSwitchElement =>
      radios.find((one) => one.value === value)!;
    const checkedValues = (): string[] =>
      radios.filter((one) => one.checked).map((one) => one.value!);

    beforeEach(() => {
      radios = Array.from(fixture.nativeElement.querySelectorAll('mds-input-switch[type=radio]'));
    });

    it('checks the radio whose value is the control value', () => {
      expect(checkedValues()).toEqual(['m']);

      host.size.setValue('l');

      expect(checkedValues()).toEqual(['l']);
    });

    it('checks no radio when the control value matches none', () => {
      host.size.setValue(null);

      expect(checkedValues()).toEqual([]);
    });

    it('compares the control value with the string value of each radio, strictly', () => {
      radio('m').value = '1';
      const number = new FormControl<unknown>(1);
      // the radio value is a string prop: the number 1 is not the radio of value "1"
      host.size.setValue(number.value as string);

      expect(checkedValues()).toEqual([]);

      host.size.setValue('1');

      expect(checkedValues()).toEqual(['1']);
    });

    it('sets the control to the value of the radio the user checks', async () => {
      await clickRendered(radio('s'));

      await vi.waitFor(() => expect(host.size.value).toBe('s'));
      expect(host.size.dirty).toBe(true);
      // the group follows: the component unchecks the radios of the same name
      expect(checkedValues()).toEqual(['s']);
    });

    it('reports a radio checked again after another one of its group', async () => {
      await clickRendered(radio('s'));
      await vi.waitFor(() => expect(host.size.value).toBe('s'));

      await clickRendered(radio('m'));

      await vi.waitFor(() => expect(host.size.value).toBe('m'));
    });

    it('turns every radio of the group off and on with the control', async () => {
      host.size.disable();
      for (const one of radios) await expectDisabled(one, 'input', true);

      host.size.enable();
      for (const one of radios) await expectDisabled(one, 'input', false);
    });

    it('takes the radio accessor alone, the boolean one going to switches and checkboxes', () => {
      // two accessors on one element would make Angular throw at the binding
      const accessorsOf = (selector: string) =>
        fixture.debugElement.query(By.css(selector)).injector.get(NG_VALUE_ACCESSOR);

      expect(accessorsOf('mds-input-switch[type=radio]')).toEqual([expect.any(RadioValueAccessor)]);
      expect(accessorsOf('mds-input-switch[type=checkbox]')).toEqual([
        expect.any(BooleanValueAccessor),
      ]);
    });
  });
});

@Component({
  imports: [MagmaModule, FormsModule],
  template: `<mds-input [(ngModel)]="name"></mds-input>`,
})
class TemplateFormHostComponent {
  name = 'iniziale';
}

describe('Template-driven forms value accessors', () => {
  it('binds a form component with [(ngModel)] both ways', async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateFormHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(TemplateFormHostComponent);
    fixture.detectChanges();
    const input: HTMLMdsInputElement = fixture.nativeElement.querySelector('mds-input');
    await hydrated(input);
    // ngModel writes the model in a microtask
    await fixture.whenStable();

    expect(input.value).toBe('iniziale');

    typeInto(nativeControl(input, 'input'), 'digitato');

    await vi.waitFor(() => expect(fixture.componentInstance.name).toBe('digitato'));
  });
});

@Component({
  imports: [MagmaModule, ReactiveFormsModule],
  template: `
    <mds-input-date-range>
      <mds-input-date slot="start" [formControl]="start"></mds-input-date>
      <mds-input-date slot="end" [formControl]="end"></mds-input-date>
    </mds-input-date-range>
  `,
})
class DateRangeHostComponent {
  readonly start = new FormControl<string | null>('');
  readonly end = new FormControl<string | null>('');
}

describe('mds-input-date-range bound through its fields', () => {
  it('updates the control of each field when the range sets its dates', async () => {
    await TestBed.configureTestingModule({ imports: [DateRangeHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DateRangeHostComponent);
    fixture.detectChanges();
    const range: HTMLMdsInputDateRangeElement =
      fixture.nativeElement.querySelector('mds-input-date-range');
    await hydrated(range);
    for (const field of Array.from(range.querySelectorAll('mds-input-date'))) {
      await hydrated(field);
    }

    // a pick in the calendar of the range, or a preselection, sets its dates
    range.startDate = '2026-11-02';
    range.endDate = '2026-11-08';

    await vi.waitFor(() => {
      expect(fixture.componentInstance.start.value).toBe('2026-11-02');
      expect(fixture.componentInstance.end.value).toBe('2026-11-08');
    });
  });
});
