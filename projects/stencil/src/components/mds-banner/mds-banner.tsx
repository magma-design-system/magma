import { Component, Element, Event, EventEmitter, Host, Prop, h } from '@stencil/core'
import { ToneSimpleVariantType, ThemeVariantType } from '@type/variant'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import { KeyboardManager } from '@common/keyboard-manager'

/**
 * @slot actions - TODOSLOT
 */
@Component({
  tag: 'mds-banner',
  styleUrl: 'mds-banner.css',
  shadow: true,
})
export class MdsBanner {

  private actions: boolean
  private km = new KeyboardManager()

  @Element() host: HTMLMdsBannerElement

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

  private deletableHandler = (): void => {
    if (this.deletable) {
      const closeIcon = this.host.shadowRoot?.querySelector('.close-icon') as HTMLElement
      this.km.addElement(closeIcon)
      this.km.attachClickBehavior()
      return
    }
    this.km.detachClickBehavior()
  }

  componentWillLoad (): void {
    this.actions = this.host.querySelector('[slot="actions"]') !== null
  }

  componentDidLoad (): void {
    this.deletableHandler()
  }

  componentDidUpdate (): void {
    this.deletableHandler()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  /**
   * Emits when the url view is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsBannerClose' }) closeEvent: EventEmitter<void>

  private closeBanner = (): void => {
    this.closeEvent.emit()
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
          { this.deletable && <i class="svg close-icon focusable" innerHTML={miBaselineClose} onClick={this.closeBanner} role="button" tabindex="0" title={this.closeLabel}/>}
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
