import { Component, Element, Host, h, Prop } from '@stencil/core'
import { setAttributeIfEmpty } from '@common/aria'
import { usageVariant } from './meta/variants'
import { UsageType } from './meta/types'
import clsx from 'clsx'

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
  @Prop() readonly variant?: UsageType = 'info'

  /**
   * Specifies the alias of the usage phrase on the top of the component
   */
  @Prop() readonly alias?: string

  componentDidLoad ():void {
    this.addAriaAttributes()
  }

  private addAriaAttributes (): void {
    const { alias } = usageVariant[this.variant]
    setAttributeIfEmpty(this.host, 'aria-label', this.alias ?? alias)
  }

  render () {
    const { alias, icon } = usageVariant[this.variant]
    return (
      <Host>
        <header class={clsx('header')} aria-hidden="true">
          <div class="badge">
            <mds-icon class="icon" name={icon}/>
            <mds-text typography="h6">{ this.alias ?? alias }</mds-text>
          </div>
        </header>
        <slot/>
      </Host>
    )
  }

}
