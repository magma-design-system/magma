import { Component, Element, AttachInternals, Host, h, Prop, State, Watch } from '@stencil/core';
import { setFormValue } from '@common/form';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

export interface MdsInputOtpInterface {
  length?: number;
  autosubmit?: boolean;
  value?: string;
}

@Component({
  tag: 'mds-input-otp',
  styleUrl: 'mds-input-otp.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputOtp {
  @Element() private element: HTMLMdsInputOtpElement;
  @AttachInternals() internals: ElementInternals;
  // the value of load, which a form reset brings back as the value attribute of a native input
  private loadValue = '';
  // the digit of each cell, by position: value joins them and drops the empty ones
  @State() digits: string[] = [];
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * The accessible name of the code: each digit is announced as a position inside it, the
   * fields being separate controls a screen reader reaches one at a time.
   */
  @Prop({ attribute: 'aria-label' }) readonly accessibleName?: string;

  /**
   * Number of digits in the OTP code
   */
  @Prop() readonly length: number = 6;

  /**
   * Automatically submits the form when the OTP code is complete
   */
  @Prop({ reflect: true }) readonly autosubmit: boolean = false;

  /**
   * The current value of the OTP code: a value set in the markup or by code fills the cells from
   * the first one
   */
  @Prop({ mutable: true, reflect: true }) value?: string = '';

  @Watch('value')
  protected valueChanged(newValue?: string): void {
    // the value a typed digit writes already matches the cells
    if ((newValue ?? '') === this.digits.join('')) return;
    this.fillCells(newValue ?? '');
  }

  /** Like a native input, a form reset brings back the code of load. */
  formResetCallback(): void {
    this.fillCells(this.loadValue);
  }

  componentWillLoad(): void {
    this.loadValue = this.value ?? '';
    this.fillCells(this.loadValue);
  }

  /** Puts a code in the cells, from the first one, as many digits as there are cells. */
  private fillCells(code: string): void {
    this.digits = Array.from(code).slice(0, this.length);
    this.updateValue();
  }

  /** Joins the cells into value, the code the form submits. */
  private updateValue(): void {
    this.value = this.digits.join('');
    setFormValue(this.internals, this.value);
  }

  private setOtpDigit = (currentInput: HTMLMdsInputElement, digit: string): void => {
    const index = Array.from(this.element.shadowRoot!.querySelectorAll('mds-input')).indexOf(
      currentInput,
    );
    const digits = [...this.digits];
    digits[index] = digit;
    this.digits = digits;
    this.updateValue();
  };

  private submit = (currentInput: HTMLMdsInputElement): void => {
    const isOtpCompleted = (this.value ?? '').length === this.length;
    currentInput.blur();

    if (this.autosubmit && isOtpCompleted) {
      this.internals.form?.requestSubmit();
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.ctrlKey) {
      return;
    }

    // e.preventDefault() must be called *outside* the ctrlKey check,
    // otherwise the onPaste event won't be triggered correctly
    e.preventDefault();

    if (isNaN(Number(e.key))) {
      return;
    }

    const currentInput = e.target as HTMLMdsInputElement;
    this.setOtpDigit(currentInput, e.key);

    const nextInput = currentInput.nextElementSibling as HTMLMdsInputElement;

    if (nextInput != null) {
      nextInput.setFocus();
    } else {
      this.submit(currentInput);
    }
  };

  private handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();

    const pastedText = e.clipboardData?.getData('text');

    if (isNaN(Number(pastedText))) {
      return;
    }

    const digits = pastedText?.split('') ?? [];
    let currentInput = e.target as HTMLMdsInputElement;
    for (const currentDigit of digits) {
      this.setOtpDigit(currentInput, currentDigit);

      currentInput = currentInput.nextElementSibling as HTMLMdsInputElement;

      if (currentInput != null) {
        currentInput.setFocus();
      } else {
        this.submit(currentInput);
        return;
      }
    }
  };

  private digitName = (index: number): string => {
    const digit = this.t.get('digit', { position: index + 1, length: this.length });
    return (this.accessibleName ?? '') !== '' ? `${this.accessibleName}, ${digit}` : digit;
  };

  render() {
    return (
      <Host>
        {Array.from({ length: this.length }).map((_, index) => (
          <mds-input
            aria-label={this.digitName(index)}
            class="input"
            maxlength={1}
            onKeyDown={this.handleKeyDown}
            onPaste={this.handlePaste}
            value={this.digits[index] ?? ''}
          ></mds-input>
        ))}
      </Host>
    );
  }
}
