import { Component, Host, h, Prop } from '@stencil/core'
import { usageVariant } from './meta/variants'
import { UsageType } from './meta/types'
import clsx from 'clsx'

@Component({
  tag: 'mds-usage',
  styleUrl: 'mds-usage.css',
  shadow: true,
})
export class MdsUsage {

  /**
   * Specifies the delay when the tooltip will trigger
   */
  @Prop() readonly variant?: UsageType = 'do'

  render () {
    const { alias, border, color, icon } = usageVariant[this.variant]
    return (
      <Host>
        <header class={clsx('header', border)}>
          <mds-icon name={icon} class={ color }/>
          <mds-text typography="h6">{ alias }</mds-text>
        </header>
        <div class="content">
          <slot/>
        </div>
      </Host>
    )
  }

}
