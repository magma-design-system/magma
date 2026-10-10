import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  Watch,
  State,
} from '@stencil/core';
import { setFormValue } from '@common/form';
import { preferenceStore } from '@common/preference';

/**
 * @part header - The element containing the labels displayed over the input element
 * @part track - The element containing the track of the input range
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 */
@Component({
  tag: 'mds-input-range',
  styleUrl: 'mds-input-range.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputRange {
  @State() private progress: number;
  private label: string;
  private inputElement: HTMLInputElement;
  // the value of load, which a form reset brings back as the value attribute of a native input;
  // undefined when the markup sets none, and the native default (the middle of the range) applies
  private loadValue?: number;
  @Element() private element: HTMLMdsInputRangeElement;
  @AttachInternals() internals: ElementInternals;

  // the disabled state of the host as a form control: its own disabled, or a disabled fieldset
  // around it, which disables the host but not the native control in its shadow root
  @State() private formDisabled = false;

  /**
   * A function to custom how value is represented
   */
  @Prop() readonly formatValue?: (value: number) => string;

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * The greatest value in the range of permitted values
   */
  @Prop() readonly max: number = 100;

  /**
   * The lowest value in the range of permitted values
   */
  @Prop() readonly min: number = 0;

  /**
   * The step attribute is a number that specifies the granularity that
   * the value must adhere to, or the special value any, which is described below.
   */
  @Prop() readonly step: number = 1;

  /**
   * Sets if the component is disabled
   */
  @Prop({ mutable: true, reflect: true }) disabled?: boolean;

  /**
   * The value attribute contains a number which contains a representation of the selected number.
   */
  @Prop({ mutable: true, reflect: true }) value: number;

  /**
   * Emits when the input range is changed
   */
  @Event({ eventName: 'mdsInputRangeChange' }) changeEvent: EventEmitter<number>;

  /** As on a native input, a step that is not a positive number falls back to the default, 1. */
  private allowedStep(): number {
    const step = Number(this.step);
    return step > 0 ? step : 1;
  }

  private calculateProgress(): void {
    // validate value
    let v = Number(this.inputElement.value);
    const step = this.allowedStep();
    // multiplier is needed to manage decimal value and step, so we can work with integer value and avoid decimal division
    const multiplier = Math.pow(10, this.countDecimals(step));
    if (v > this.max) v = this.max;
    else if (v < this.min) v = this.min;
    if (((v - this.min) * multiplier) % (step * multiplier) !== 0) {
      v =
        (Math.round((v * multiplier - this.min * multiplier) / (step * multiplier)) *
          (step * multiplier) +
          this.min * multiplier) /
        multiplier;
    }
    this.value = v;
    setFormValue(this.internals, this.value.toString());
    const total = this.max - this.min;
    const current = this.value - this.min;
    this.progress = (current / total) * 100;
  }

  private onInput = () => {
    // a range input always holds a number: the browser sanitizes anything else
    // trigger valueChanged that update progress and emit event
    this.value = Number(this.inputElement.value);
  };

  private countDecimals(num: number) {
    if (Math.floor(num) === num) return 0;
    return num.toString().split('.')[1].length || 0;
  }

  @Watch('disabled')
  protected disabledChanged(newValue: boolean): void {
    /**
     * This is related to ALL disabled attributes set on Magma input components
     * if solved, please check mds-button, mds-input, mds-input-*
     * https://github.com/ionic-team/stencil/issues/5461
     */
    if (newValue) {
      setFormValue(this.internals, null);
    }
  }

  @Watch('value')
  valueChanged(newValue: string, oldValue: string): void {
    if (newValue === oldValue) return;
    this.inputElement.value = this.value.toString();
    this.calculateProgress();
    this.changeEvent.emit(this.value);
  }

  @Watch('min')
  minChanged(): void {
    this.calculateProgress();
  }

  @Watch('max')
  maxChanged(): void {
    this.calculateProgress();
  }

  @Watch('step')
  stepChanged(): void {
    this.calculateProgress();
  }

  /** Like a native input, a form reset brings back the value of load, thumb included. */
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  private isDisabled = (): boolean => !!this.disabled || this.formDisabled;

  formResetCallback(): void {
    // an empty value makes the native input take its default, the middle of the range
    this.inputElement.value = this.loadValue === undefined ? '' : String(this.loadValue);
    this.onInput();
  }

  componentWillLoad(): void {
    const value = Number(this.value ?? NaN);
    this.loadValue = Number.isNaN(value) ? undefined : value;
  }

  componentDidLoad(): void {
    this.onInput(); // define value
    this.label = this.element.textContent ?? '';
    this.calculateProgress();
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <header class="header" part="header">
          <mds-text class="label" typography="label">
            <slot />
          </mds-text>
          <mds-text class="value" typography="label">
            {this.formatValue ? this.formatValue(this.value) : this.value}
          </mds-text>
        </header>
        <div class="range">
          <div class="track" part="track">
            <div class="contrast-area"></div>
            <div class="track-total">
              <div
                class="track-progress"
                style={{ '--mds-input-range-progress': `${this.progress ?? 0}` }}
              ></div>
            </div>
          </div>
          <input
            ref={(el) => (this.inputElement = el as HTMLInputElement)}
            class="field"
            aria-label={this.label}
            disabled={this.isDisabled()}
            max={this.max}
            min={this.min}
            onInput={this.onInput}
            step={this.step}
            type="range"
            value={this.value}
            name={this.name}
          />
        </div>
      </Host>
    );
  }
}
