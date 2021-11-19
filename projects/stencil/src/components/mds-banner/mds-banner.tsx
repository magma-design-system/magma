import { Component, Host, h, Element, Event, EventEmitter, Prop } from '@stencil/core'
import { ToneSimpleVariantType, ThemeVariantType } from '../../types/variant'
import clsx from 'clsx'

@Component({
  tag: 'mds-banner',
  styleUrl: 'mds-banner.css',
  shadow: true,
})
export class MdsBanner {

  private actions: boolean

  @Element() hostElement: HTMLMdsBannerElement

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'light'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneSimpleVariantType = 'strong'

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

  /**
   * Emits when the url view is closed
   */
  @Event() close: EventEmitter<void>

  private closeBanner = (): void => {
    this.close.emit()
  }

  /**
   * @slot default - To put the text inside the component
   * @slot actions - Will host the bottom action of the component
   */

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
              { this.deletable && <mds-icon name="close" class="close-icon" onClick={this.closeBanner} /> }
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
            <mds-icon name="close" class="close-icon close-icon--isolated" onClick={this.closeBanner}/>
          }
          { this.headline === undefined && this.icon && <mds-icon name={ this.icon } class="icon"/> }
          <div class="text">
            <slot/>
          </div>
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
