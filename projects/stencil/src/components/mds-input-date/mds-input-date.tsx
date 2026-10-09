import {
  Component,
  Element,
  Host,
  h,
  Method,
  Prop,
  State,
  Event,
  EventEmitter,
  Watch,
  AttachInternals,
  Listen,
} from '@stencil/core';
import { setFormValue } from '@common/form';
import { updateValidity, ValidityProblem } from '@common/validity';
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg';
import { DateTime } from 'luxon';
import { preferenceStore } from '@common/preference';
import { ThemeInputVariantType } from '@type/variant';
import { MdsValidationErrors } from 'src/components';

// TODO add input validation manager for error message
@Component({
  tag: 'mds-input-date',
  styleUrl: 'mds-input-date.css',
  shadow: true,
  formAssociated: true,
})
export class MdsInputDate {
  @Element() host: HTMLMdsInputDateElement;
  @AttachInternals() internals: ElementInternals;
  private isSlotted: boolean = false;
  // the rule the value breaks, reported to the form; undefined when the value is valid
  private problem?: ValidityProblem;
  // the value at load, which a form reset brings back as the value attribute of a native input
  private defaultValue = '';
  @State() empty: boolean | undefined = undefined;
  @State() isValid: boolean;
  // true once the user has edited or left the field, or a stopped submit pointed at it: from then
  // on the validation drives the variant, like :user-invalid on a native control
  @State() touched: boolean = false;

  /**
   * The accessible name of the native control: the label a screen reader announces. An
   * `mds-input-field` around the component passes its own label down here, so the attribute
   * is only written by hand when the control stands on its own. The placeholder is deliberately
   * not a fallback: it disappears as soon as the field is filled.
   */
  @Prop({ attribute: 'aria-label' }) readonly accessibleName?: string;

  /**
   * Specifies the value of the input
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) value: string = '';

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * Sets the variant of the input field
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeInputVariantType = 'primary';

  /**
   * Specifies the min date of the range, user cannot set dates before this date
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true, mutable: true }) min: string | null = null;

  /**
   * Specifies the max date of the range, user cannot set dates after this date
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true, mutable: true }) max: string | null = null;

  /**
   * Specifies the delay in milliseconds before closing the calendar dropdown, if the value is 0 the dropdown will not close
   * @description Default is 500
   */
  @Prop({ reflect: true }) readonly delay: number = 500;

  /**
   * Hides the highlight on today's date in the calendar.
   */
  @Prop({ reflect: true }) readonly hideToday: boolean = false;

  /**
   * If true, the element is displayed as disabled
   */
  @Prop({ reflect: true }) readonly disabled?: boolean = false;

  /**
   * Specifies that the element is read-only
   */
  @Prop({ reflect: true }) readonly readonly?: boolean = false;

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop({ reflect: true }) readonly required?: boolean = false;

  /**
   * Emits a boolean event when a input execute validation
   */
  @Event({ eventName: 'mdsInputValidation' }) validationEvent!: EventEmitter<boolean>;

  @State() calendarKey: number = 0;
  @State() dropdownRef?: HTMLMdsDropdownElement;
  @State() hasFocus = false;
  /**
   * Emitted when the selected date value changes.
   */
  @Event({ eventName: 'mdsInputDateSelect', bubbles: true, composed: true })
  valueChange: EventEmitter<string>;

  @Watch('value')
  handleValue(): void {
    this.valueChange.emit(this.value);
    this.validateValue();
  }

  /**
   * Checks the value: the validity reported to the form and the required tip follow it at once,
   * the variant and `mdsInputValidation` only once the field is touched.
   */
  private validateValue(hasBadInput: boolean = false): void {
    const date = DateTime.fromISO(this.value);

    const hasValue = Boolean(this.value);
    const hasInvalidValue = hasValue && !date.isValid;
    this.problem = this.findProblem(date, hasBadInput || hasInvalidValue);
    this.isValid = this.problem === undefined;
    setFormValue(this.internals, this.isValid ? this.value : null);
    this.empty = hasBadInput || hasInvalidValue ? true : undefined;
    this.updateFormValidity();

    if (!this.touched) return;
    this.variant = this.isValid ? 'primary' : 'error';
    this.validationEvent.emit(this.isValid);
  }

  /**
   * A submit stopped by an invalid date, or a `checkValidity()` of its form, touches the field, so
   * that it shows what is wrong.
   */
  @Listen('invalid')
  protected invalidHandler(): void {
    this.touched = true;
    this.validateValue();
  }

  /** The rule the value breaks, `undefined` when it breaks none. */
  private findProblem(date: DateTime, isBadInput: boolean): ValidityProblem | undefined {
    if (isBadInput) return { rule: 'invalidDate' };
    if (this.required && (this.value ?? '') === '') return { rule: 'required' };
    if (!date.isValid) return undefined;
    if ((this.max ?? '') !== '' && DateTime.fromISO(this.max!) < date) {
      return { rule: 'maxDate', context: { max: this.formatDate(this.max!) } };
    }
    if ((this.min ?? '') !== '' && DateTime.fromISO(this.min!) > date) {
      return { rule: 'minDate', context: { min: this.formatDate(this.min!) } };
    }
    return undefined;
  }

  /** An ISO date as the page language writes it, for the messages. */
  private formatDate(iso: string): string {
    return DateTime.fromISO(iso)
      .setLocale(preferenceStore.state.language)
      .toLocaleString(DateTime.DATE_SHORT);
  }

  /**
   * Reports the validity of the value to the form, with the rules that drive the variant: like a
   * native control, an invalid date stops the submit of its form.
   */
  private updateFormValidity(): void {
    const input = this.host.shadowRoot?.querySelector<HTMLInputElement>('.input') ?? undefined;
    updateValidity(this.internals, this.problem, input);
  }

  componentDidRender(): void {
    // the native input the message points at exists from the first render on
    this.updateFormValidity();
  }

  /**
   * Sets focus on the underlying input element.
   */
  @Method()
  async focusInput(): Promise<void> {
    const input: HTMLInputElement = this.host.shadowRoot?.querySelector(
      '.input',
    ) as HTMLInputElement;
    input.focus();
  }

  /**
   * Sets the input value.
   * @param value the value to set, in ISO format (YYYY-MM-DD)
   */
  @Method()
  async setValue(value: string): Promise<void> {
    this.value = value;
    this.validateValue();
    return Promise.resolve();
  }
  /**
   * Returns the current validation errors, or `null` if the value is valid.
   * @returns the validation errors, or `null` when valid
   */
  @Method()
  async getErrors(): Promise<MdsValidationErrors | null> {
    return Promise.resolve(this.isValid ? null : { error: '' });
  }

  /**
   * Like a native input, a form reset brings back the value of load and forgets the interaction:
   * the field looks pristine until the user edits or leaves it again.
   */
  formResetCallback(): void {
    const { touched } = this;
    this.touched = false;
    // the native input can hold a partial date that never reached the value
    const input = this.host.shadowRoot?.querySelector<HTMLInputElement>('.input');
    if (input) input.value = this.defaultValue;
    this.value = this.defaultValue;
    this.validateValue();
    if (touched) this.variant = 'primary';
  }

  componentWillLoad(): void {
    this.isSlotted = !(
      this.host.getAttribute('slot') === null || this.host.getAttribute('slot') === ''
    );
    this.value = this.value || '';
    this.defaultValue = this.value;
    this.clampRange();
    this.validateValue();
  }

  /**
   * Snaps `max` to `min` when the range is reversed.
   * @returns true when `max` changed
   */
  private clampRange(): boolean {
    if (this.min === null || this.min === '' || this.max === null || this.max === '') return false;
    if (DateTime.fromISO(this.max) < DateTime.fromISO(this.min)) {
      this.max = this.min;
      return true;
    }
    return false;
  }

  /**
   * Validates again when a rule changes after load, as it does with the React wrappers under SSR,
   * which set the props on an element that has already loaded.
   */
  @Watch('max')
  @Watch('min')
  @Watch('required')
  protected validationRulesChanged(): void {
    // a reversed range snaps max to min, and that change runs this watcher again
    if (this.clampRange()) return;
    this.validateValue();
  }

  private handleChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.touched = true;
    // manage case when i insert 0 on date and default input behavior change in 01 instead of resetting all date
    if (input.value !== '') this.value = input.value;
    this.validateValue(input.validity.badInput);
  };

  private onBlur = (ev: Event) => {
    const input = ev.target as HTMLInputElement;
    this.hasFocus = false;
    this.touched = true;
    this.value = input.value;
    this.validateValue(input.validity.badInput);
  };

  private onFocus = (ev: Event) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement;
    this.hasFocus = true;
    if (this.readonly) {
      // setTimeout to avoid Safari 14.1.2
      // to unselect text when mouse is clicked slowly
      setTimeout(() => {
        input.select();
      }, 10);
    }
  };

  private readonly handleOpenCalendarClick = (): void => {
    this.calendarKey += 1;
  };

  private readonly handleCalendarChange = (
    ev: CustomEvent<{ startDate: string; endDate?: string }>,
  ): void => {
    this.touched = true;
    this.value = ev.detail.startDate;

    if (this.delay === 0) return;
    const { dropdownRef } = this;
    if (dropdownRef) {
      setTimeout(() => {
        dropdownRef.visible = false;
      }, this.delay);
    }
  };

  render() {
    return (
      <Host
        empty={this.empty}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <input
          aria-label={this.accessibleName}
          value={this.value}
          id="dateInput"
          class="input"
          part="input-date"
          type="date"
          disabled={this.disabled}
          name={this.name}
          readOnly={this.readonly}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onInput={this.handleChange}
          onChange={this.handleChange}
        />
        {!this.isSlotted && (
          <div class="action-open-calendar-wrapper">
            <mds-button
              id="calendar-dropdown"
              class="action-open-calendar"
              // a read-only date cannot change, from the calendar either
              disabled={this.disabled || this.readonly}
              variant="dark"
              tone="text"
              icon={miBaselineCalendarToday}
              onClick={this.handleOpenCalendarClick}
            ></mds-button>
          </div>
        )}
        <mds-input-tip position="top" active={this.hasFocus}>
          {this.disabled && <mds-input-tip-item expanded variant="disabled"></mds-input-tip-item>}
          {this.readonly && <mds-input-tip-item expanded variant="readonly"></mds-input-tip-item>}
          {this.required && (
            <mds-input-tip-item
              expanded={this.hasFocus}
              variant={this.isValid ? 'required-success' : 'required'}
            ></mds-input-tip-item>
          )}
        </mds-input-tip>
        {/* the panel holds a calendar, not a list of entries: it is a group, not the
            menu the dropdown declares by default */}
        {!this.isSlotted && (
          <mds-dropdown
            placement="bottom-end"
            disable-auto-placement
            ref={(el) => (this.dropdownRef = el as HTMLMdsDropdownElement)}
            role="group"
            target="#calendar-dropdown"
          >
            <mds-calendar
              key={this.calendarKey}
              singlePicker
              hideToday={this.hideToday}
              onMdsCalendarChange={this.handleCalendarChange}
              startDate={this.value}
              {...(this.min !== null && this.min !== '' ? { min: this.min } : {})}
              {...(this.max !== null && this.max !== '' ? { max: this.max } : {})}
            ></mds-calendar>
          </mds-dropdown>
        )}
      </Host>
    );
  }
}
