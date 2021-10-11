import { Component, Host, h, Prop } from '@stencil/core'
import { ToneStrictVariantType, ThemeVariantType } from '../../types/variant'

@Component({
  tag: 'mds-benchmark-bar',
  styleUrl: 'mds-benchmark-bar.css',
  shadow: true,
})
export class MdsBenchmarkBar {

  /**
   * A value between 0 and 100 that rapresents the benchmark
   */
  @Prop() readonly value?: number = 0

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'dark'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneStrictVariantType = 'strong'

  render () {
    return (
      <Host>
        <div class="infos">
          <mds-text typography="option" class="label"><slot/></mds-text>
          <mds-text typography="option" class="value">{this.value}</mds-text>
        </div>
        <mds-progress class="progress" variant={this.variant} tone={this.tone} progress={this.value / 100}/>
      </Host>
    )
  }

}
