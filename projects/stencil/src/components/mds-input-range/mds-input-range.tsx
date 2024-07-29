import { AttachInternals, Component, Element, Event, EventEmitter, Host, h, Prop, Watch, State } from '@stencil/core'

@Component({
  tag: 'mds-input-range',
  styleUrl: 'mds-input-range.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputRange {

  @State() private progress: number
  private inputElement: HTMLInputElement

  @Element() private element: HTMLMdsInputRangeElement
  @AttachInternals() internals: ElementInternals

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
   * The value attribute contains a number which contains a representation of the selected number.
   */
  @Prop({ mutable: true, reflect: true }) value: number

  /**
   * Emits when the input range is changed
   */
  @Event({ eventName: 'mdsInputRangeChange' }) changeEvent: EventEmitter<number>

  calculateProgress (): void {
    // validate value
    let v = parseInt(this.inputElement.value)
    if (v > this.max) v = this.max
    else if (v < this.min) v = this.min
    if ((v - this.min) % (this.step) !== 0) v = Math.round(v / this.step) * this.step - this.min
    this.value = v

    this.internals.setFormValue(this.value.toString())
    const total = this.max - this.min
    const current = this.value - this.min
    this.progress = current * 100 / total
  }

  private onInput = () => {
    // trigger valueChanged that update progress and emit event
    this.value = parseInt(this.inputElement.value)
  }
  @Watch('value')
  valueChanged (): void {
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
    if (this.step < 1) throw Error('step cant be negative or zero')
    this.calculateProgress()
  }

  componentDidLoad (): void {
    this.inputElement = this.element.shadowRoot?.querySelector('.field') as HTMLInputElement
    this.value = parseInt(this.inputElement.value)
    this.calculateProgress()
  }

  render () {
    return (
      <Host>
        <header class="header">
          <mds-text class="label" typography="label"><slot/></mds-text>
          <mds-text class="value" typography="label">{ this.value }</mds-text>
        </header>
        <div class="range">
          <div class="track">
            <div class="track-total">
              <div class="track-progress" style={{ width: `${this.progress}%` }}></div>
            </div>
          </div>
          <input
            class="field"
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
