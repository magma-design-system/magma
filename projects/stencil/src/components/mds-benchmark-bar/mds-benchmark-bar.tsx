import { Component, Host, h, Prop } from '@stencil/core'
import { ThemeVariantType } from '../../types/variant'
import { BenchmarkBarTypographyType } from './meta/types'

@Component({
  tag: 'mds-benchmark-bar',
  styleUrl: 'mds-benchmark-bar.css',
  shadow: true,
})
export class MdsBenchmarkBar {

  /**
   * The typography of the component
   */
  @Prop() readonly typography?: BenchmarkBarTypographyType = 'label'

  /**
   * A value between 0 and 100 that rapresents the benchmark
   */
  @Prop() readonly value?: number = 0

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'dark'

  render () {
    return (
      <Host>
        <div class="infos">
          <mds-text typography={ this.typography } class="label"><slot/></mds-text>
          <mds-text typography={ this.typography } class="value">{this.value}</mds-text>
        </div>
        <mds-progress class="progress" variant={this.variant} progress={this.value / 100}/>
      </Host>
    )
  }

}
