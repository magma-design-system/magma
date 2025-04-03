import { AttachInternals, Component, Element, Event, EventEmitter, Host, h, Prop, Watch, State } from '@stencil/core'

/**
 * @part header - The element containing the labels displayed over the input element
 */
@Component({
  tag: 'mds-input-range',
  styleUrl: 'mds-input-range.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputRange {

  @State() private progress: number
  private label: string
  private inputElement: HTMLInputElement
  private decimalPlaces: number // number of decimal places
  @Element() private element: HTMLMdsInputRangeElement
  @AttachInternals() internals: ElementInternals

  /**
   * A function to custom how value is represented
   */
  @Prop() readonly formatValue?: (value: number) => string

  /**
   * The greatest value in the range of permitted values
   */
  @Prop() readonly max: number = 100

  /**
   * The lowest value in the range of permitted values
   */
  @Prop() readonly min: number = 0

  /**
   * The step attribute is a number that specifies the granularity that
   * the value must adhere to, or the special value any, which is described below.
   */
  @Prop() readonly step: number = 1

  /**
   * Sets if the component is disabled
   */
  @Prop({ mutable: true, reflect: true }) disabled?: boolean

  /**
   * The value attribute contains a number which contains a representation of the selected number.
   */
  @Prop({ mutable: true, reflect: true }) value: number

  /**
   * Emits when the input range is changed
   */
  @Event({ eventName: 'mdsInputRangeChange' }) changeEvent: EventEmitter<number>

  calculateProgress (): void {
    // validate value
    let v = Number(this.inputElement.value)
    // multiplier is needed to manage decimal value and step, so we can work with integer value and avoid decimal division
    const multiplier = Math.pow(10, this.decimalPlaces)
    if (v > this.max) v = this.max
    else if (v < this.min) v = this.min
    if ((v - this.min) * multiplier % (this.step * multiplier) !== 0) {
      v = (Math.round((v * multiplier - this.min * multiplier) / (this.step * multiplier)) * (this.step * multiplier) + this.min * multiplier) / multiplier
    }
    this.value = v
    this.internals.setFormValue(this.value.toString())
    const total = this.max - this.min
    const current = this.value - this.min
    this.progress = current / total * 100
  }

  private onInput = () => {
    if (Number.isNaN(this.inputElement.value)) throw Error(`Entered value ${this.inputElement.value} is not a Number`)
    // trigger valueChanged that update progress and emit event
    this.value = Number(this.inputElement.value)
  }

  private countDecimals (num: number) {
    if (Math.floor(num) === num) return 0
    return num.toString().split('.')[1].length || 0
  }

  @Watch('disabled')
  protected disabledChanged (newValue: boolean):void {
    /**
     * This is related to ALL disabled attributes set on Magma input components
     * if solved, please check mds-button, mds-input, mds-input-*
     * https://github.com/ionic-team/stencil/issues/5461
     */
    if (newValue) {
      this.internals.setFormValue(null)
    }
  }

  @Watch('value')
  valueChanged (newValue: string, oldValue:string): void {
    if (newValue === oldValue) return
    this.inputElement.value = this.value.toString()
    this.calculateProgress()
    this.changeEvent.emit(this.value)
  }

  @Watch('min')
  minChanged (): void {
    this.calculateProgress()
  }

  @Watch('max')
  maxChanged (): void {
    this.calculateProgress()
  }

  @Watch('step')
  stepChanged (): void {
    if (this.step <= 0) throw Error('step cant be negative or zero')
    this.decimalPlaces = this.countDecimals(this.step)
    this.calculateProgress()
  }

  formResetCallback (): void {
    this.internals.setFormValue('')
  }

  componentDidLoad (): void {
    this.decimalPlaces = this.countDecimals(this.step)
    this.onInput() // define value
    this.label = this.element.textContent ?? ''
    this.calculateProgress()
  }

  render () {
    return (
      <Host>
        <header class="header" part="header">
          <mds-text class="label" typography="label"><slot/></mds-text>
          <mds-text class="value" typography="label">{ this.formatValue ? this.formatValue(this.value) : this.value }</mds-text>
        </header>
        <div class="range">
          <div class="track">
            <div class="contrast-area"></div>
            <div class="track-total">
              <div class="track-progress" style={{ width: `${this.progress}%` }}></div>
            </div>
          </div>
          <input
            ref = {el => this.inputElement = el as HTMLInputElement}
            class="field"
            aria-label={this.label}
            disabled={this.disabled}
            max={this.max}
            min={this.min}
            onInput={this.onInput}
            step={this.step}
            type="range"
            value={this.value}
          />
        </div>
      </Host>
    )
  }

}
