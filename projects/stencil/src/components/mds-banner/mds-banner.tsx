import { Component, Element, Event, EventEmitter, Host, Prop, h } from '@stencil/core'
import { ToneSimpleVariantType, ThemeVariantType } from '../../types/variant'
import clsx from 'clsx'
import miBaselineClose from '@icon/mi/baseline/close.svg'

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
  @Prop({ reflect: true }) readonly tone?: ToneSimpleVariantType = 'weak'

  /**
   * Sets the cross icon accessibility label to perform close action on element
   */
  @Prop() readonly closeLabel? = 'Annulla'

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
  @Event({ bubbles: true, composed: true }) close: EventEmitter<void>

  private closeBanner = (): void => {
    this.close.emit()
  }

  /**
   * @slot default - To put the text inside the component
   * @slot actions - Will host the bottom action of the component
   */

  render () {
    return (
      <Host>
        <div class="body">
          { this.icon && <mds-icon class="icon" name={this.icon}/> }
          <div class="content">
            { this.headline && <mds-text class="headline" typography="h6">{ this.headline }</mds-text> }
            <div class="text">
              <slot/>
            </div>
          </div>
          { this.deletable && <i class="svg close-icon" innerHTML={miBaselineClose} onClick={this.closeBanner} role="button" tabindex="0" title={this.closeLabel}/>}
        </div>
        { this.actions
          &&
          <div class="actions">
            <slot name="actions"/>
          </div>
        }
      </Host>
    )
  }
}
