import clsx from 'clsx'
import { ButtonType, ButtonSizeType, ButtonIconPositionType, ButtonVariantType } from '@type/button'
import { Component, Host, Element, h, Prop, Watch } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { ToneVariantType } from '@type/variant'
import { TypographyType } from '@type/typography'
import { buttonSizeTypographyVariant } from './meta/variants'
import { setAttributeIfEmpty, unslugName } from '@common/aria'

@Component({
  tag: 'mds-button',
  styleUrl: 'mds-button.css',
  shadow: true,
})
export class MdsButton {

  private typography?: TypographyType
  private hasText?: boolean
  private hasNotification?: boolean
  private km = new KeyboardManager()

  @Element() host: HTMLMdsButtonElement

  /**
   * The icon displayed in the button
   */
  @Prop() readonly icon?: string

  /**
   * Specifies the horizontal position of the icon displayed in the button
   */
  @Prop() readonly iconPosition?: ButtonIconPositionType = 'left'

  /**
   * The type of the button element
   */
  @Prop() readonly type?: ButtonType = 'submit'

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonVariantType = 'primary'

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'strong'

  /**
   * Specifies the size for the button
   */
  @Prop({ reflect: true }) readonly size: ButtonSizeType = 'md'

  /**
   * Specifies if the button is active or not
   */
  @Prop({ mutable: true, reflect: true }) active: boolean

  /**
   * Specifies if the component is disabled or not
   */
  @Prop({ reflect: true }) readonly disabled: boolean

  /**
   * Specifies if the button is awaiting for a response
   */
  @Prop({ reflect: true }) readonly await: boolean

  @Watch('disabled')
  disabledChanged (newValue: boolean): void {
    if (newValue) {
      this.km.attachClickBehavior()
      return
    }
    this.km.detachClickBehavior()
  }

  @Watch('await')
  awaitChanged (newValue: boolean): void {
    this.host.setAttribute('aria-busy', newValue.toString())
    if (newValue) {
      this.km.attachClickBehavior()
      return
    }
    this.km.detachClickBehavior()
  }

  private mouseDown = () => {
    this.active = true
  }

  private mouseUp = () => {
    this.active = false
  }

  componentWillLoad ():void {
    this.hasNotification = this.host.querySelector('[slot="notification"]') !== null
    this.hasText = this.host.innerHTML !== ''
  }

  componentDidLoad ():void {
    this.km.addElement(this.host)
    if (!this.await) {
      this.km.attachClickBehavior()
    }
    this.host.setAttribute('aria-busy', this.await ? 'true' : 'false')

    if (!this.hasText && this.icon) {
      const iconTitle = unslugName(this.icon)
      if (!this.host.hasAttribute('aria-label')) {
        setAttributeIfEmpty(this.host, 'title', iconTitle)
      }
      setAttributeIfEmpty(this.host, 'aria-label', iconTitle)
    }
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  render () {
    this.typography = buttonSizeTypographyVariant[this.size] as TypographyType

    return (
      <Host class={clsx(!this.hasText && 'no-text')} onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} onMouseOut={this.mouseUp} tabindex="0" role="button">
        <div class="await">
          <mds-spinner class="spinner" running={this.await}/>
        </div>
        { this.icon && this.iconPosition === 'left' && <mds-icon aria-hidden="true" class="icon" name={this.icon} /> }
        { this.hasText && <mds-text class="text" part="label" typography={this.typography}><slot /></mds-text> }
        { this.hasNotification && <slot name="notification"/> }
        { this.icon && this.iconPosition === 'right' && <mds-icon aria-hidden="true" class="icon" name={this.icon} /> }
      </Host>
    )
  }
}
