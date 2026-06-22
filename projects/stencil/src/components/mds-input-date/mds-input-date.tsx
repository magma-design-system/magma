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
} from '@stencil/core';
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg';
import { DateTime } from 'luxon';
import { Locale } from '@common/locale';
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
  @State() empty: boolean | undefined = undefined;
  @State() isValid: boolean;
  private t: Locale = new Locale({
    el: {},
    en: {},
    es: {},
    it: {},
  });
  @State() language: string;
  @State() touched: boolean = false;
  /**
   * Updates the component's texts to the locale currently set on the host element.
   */
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.host);
  }

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

  private validateValue(hasBadInput: boolean = false): void {
    const date = DateTime.fromISO(this.value);

    const hasValue = Boolean(this.value);
    const hasInvalidValue = hasValue && !date.isValid;
    const isMissingRequiredValue = this.required && !hasValue;
    const outOfRange =
      date.isValid &&
      ((this.max && DateTime.fromISO(this.max) < date) ||
        (this.min && DateTime.fromISO(this.min) > date));

    if (hasBadInput || hasInvalidValue || isMissingRequiredValue || outOfRange) {
      this.isValid = false;
      this.variant = 'error';
      this.internals.setFormValue(null);
      this.empty = hasBadInput || hasInvalidValue ? true : undefined;
    } else {
      this.isValid = true;
      this.variant = 'primary';
      this.internals.setFormValue(this.value);
      this.empty = undefined;
    }

    this.validationEvent.emit(this.isValid);
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

  formResetCallback(): void {
    this.internals.setFormValue('');
  }

  componentWillLoad(): void {
    this.isSlotted = !(
      this.host.getAttribute('slot') === null || this.host.getAttribute('slot') === ''
    );
    this.value = this.value || '';
    this.language = this.t.lang(this.host);

    // Se max è precedente a min, imposto max uguale a min
    if (this.min !== null && this.min !== '' && this.max !== null && this.max !== '') {
      const minDate = DateTime.fromISO(this.min);
      const maxDate = DateTime.fromISO(this.max);
      if (maxDate < minDate) {
        this.max = this.min;
      }
    }
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
      <Host empty={this.empty}>
        <input
          value={this.value}
          id="dateInput"
          class="input"
          part="input-date"
          type="date"
          disabled={this.disabled}
          name={this.name}
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
              disabled={this.disabled}
              variant="dark"
              tone="text"
              icon={miBaselineCalendarToday}
              onClick={this.handleOpenCalendarClick}
            ></mds-button>
          </div>
        )}
        <mds-input-tip lang={this.language} position="top" active={this.hasFocus}>
          {this.disabled && <mds-input-tip-item expanded variant="disabled"></mds-input-tip-item>}
          {this.readonly && <mds-input-tip-item expanded variant="readonly"></mds-input-tip-item>}
          {this.required && (
            <mds-input-tip-item
              expanded={this.hasFocus}
              variant={this.isValid ? 'required-success' : 'required'}
            ></mds-input-tip-item>
          )}
        </mds-input-tip>
        {!this.isSlotted && (
          <mds-dropdown
            placement="bottom-end"
            auto-placement={false}
            ref={(el) => (this.dropdownRef = el as HTMLMdsDropdownElement)}
            target="#calendar-dropdown"
          >
            <mds-calendar
              key={this.calendarKey}
              rangePicker={false}
              lang={this.language}
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
