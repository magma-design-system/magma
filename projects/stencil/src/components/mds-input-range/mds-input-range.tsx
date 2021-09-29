import { Component, Host, h, Prop } from '@stencil/core'

@Component({
  tag: 'mds-input-range',
  styleUrl: 'mds-input-range.css',
  shadow: true,
})
export class MdsInputRange {

  /**
   * The greatest value in the range of permitted values
   */
  @Prop() readonly max?: number

  /**
   * The lowest value in the range of permitted values
   */
  @Prop() readonly min?: number

  /**
   * The step attribute is a number that specifies the granularity that
   * the value must adhere to, or the special value any, which is described below.
   */
  @Prop() readonly step?: number

  /**
   * The value attribute contains a number which contains a representation of the selected number.
   */
  @Prop({ mutable: true, reflect: true }) value?: number

  private onInput = (e: Event) => {
    this.value = e.target.value
  }

  render () {
    return (
      <Host>
        <header class="header">
          <mds-text class="label" typography="label"><slot/></mds-text>
          <mds-text class="value" typography="label">{ this.value }</mds-text>
        </header>
        <input
          max={this.max}
          min={this.min}
          onInput={this.onInput}
          step={this.step}
          type="range"
          value={this.value}
        />
      </Host>
    )
  }

}
