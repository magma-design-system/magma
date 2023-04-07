import { Component, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core'

@Component({
  tag: 'mds-input-range',
  styleUrl: 'mds-input-range.css',
  shadow: true,
})
export class MdsInputRange {

  private progress:number

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
  @Prop() readonly step?: number = 1

  /**
   * The value attribute contains a number which contains a representation of the selected number.
   */
  @Prop({ mutable: true, reflect: true }) value = 50

  /**
   * Emits when the input range is changed
   */
  @Event({ eventName: 'mdsInputRangeChange' }) changeEvent: EventEmitter<number>

  private calculateProgress = () => {
    const total = Math.abs(this.min) + Math.abs(this.max)
    const current = this.value + Math.abs(this.min)
    this.progress = current * 100 / total
  }

  private onInput = (e: Event) => {
    this.value = parseInt((e.target as HTMLInputElement).value, 10)
    this.calculateProgress()
    this.changeEvent.emit(this.value)
  }

  @Watch('value')
  valueChanged (): void {
    this.calculateProgress()
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
    this.calculateProgress()
  }

  componentWillLoad (): void {
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
