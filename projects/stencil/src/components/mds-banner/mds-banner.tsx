import { Component, Host, h, Element, Prop } from '@stencil/core'
import { BannerVariantType, ToneVariantType } from '../../types/variant'
import clsx from 'clsx'

@Component({
  tag: 'mds-banner',
  styleUrl: 'mds-banner.css',
  shadow: true,
})
export class MdsBanner {

  @Element() hostElement: HTMLMdsBannerElement

  private actions: boolean

  /**
   * Sets the banner variant colors
   */
  @Prop({ reflect: true }) readonly variant?: BannerVariantType = 'light'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'strong'

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean

  /**
   * The title on the top of the banner
   */
  @Prop() readonly headline?: string

  /**
   * An icon displayed at the top left of the banner
   */
  @Prop() readonly icon?: string

  componentWillLoad (): void {
    this.actions = this.hostElement.querySelector('[slot="actions"]') !== null
  }

  render () {
    return (
      <Host class={clsx(
        this.actions && 'has-actions',
      )}>
        { this.headline !== undefined
          &&
          <header class="header">
            <header class="header-row">
              { this.icon && <mds-icon name={ this.icon } class="icon"/> }
              <mds-text typography="h6" class="headline">{ this.headline }</mds-text>
              { this.deletable && <mds-icon name="action-close" class="close-icon"/> }
            </header>
            <hr class="separator"/>
          </header>
        }
        <div class={clsx(
          'content',
          this.headline === undefined && this.deletable && 'content--has-icon-isolated',
        )}>
          { this.headline === undefined && this.deletable
            &&
            <mds-icon name="action-close" class="close-icon close-icon--isolated"/>
          }
          { this.headline === undefined && this.icon && <mds-icon name={ this.icon } class="icon"/> }
          <mds-text class="text" typography="detail">
            <slot/>
          </mds-text>
        </div>
        { this.actions
          &&
          <mds-row class="actions">
            <slot name="actions"/>
          </mds-row>
        }
      </Host>
    )
  }
}
