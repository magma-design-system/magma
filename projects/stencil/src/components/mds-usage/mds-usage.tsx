import { Component, Element, Host, h, Prop } from '@stencil/core'
import { UsageType } from './meta/types'
import { usageVariant } from './meta/variants'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-usage',
  styleUrl: 'mds-usage.css',
  shadow: true,
})
export class MdsUsage {

  @Element() host: HTMLMdsUsageElement

  /**
   * Specifies the delay when the tooltip will trigger
   */
  @Prop() readonly variant: UsageType = 'info'

  /**
   * Specifies the alias of the usage phrase on the top of the component
   */
  @Prop() readonly alias?: string

  render () {
    const { alias, icon } = usageVariant[this.variant]
    return (
      <Host role="suggestion">
        <div class="header" aria-hidden="true">
          <div class="badge">
            <mds-icon class="icon" name={icon}/>
            <mds-text typography="h6">{ this.alias ?? alias }</mds-text>
          </div>
        </div>
        <div class="content" role={ this.variant === 'do' || this.variant === 'info' ? 'insertion' : 'deletion'}>
          <slot/>
        </div>
      </Host>
    )
  }

}
