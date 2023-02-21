import { Component, Host, Element, h, Prop } from '@stencil/core'

import {
  ButtonType,
  ButtonSizeType,
  ButtonIconPositionType,
  ButtonVariantType,
} from '../../types/button' // TODO change folder types to type
import { buttonSizeTypographyVariant } from './meta/variants'
import { TypographyType } from '../../types/typography'
import { ToneVariantType } from '../../types/variant'
import clsx from 'clsx'
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
  @Prop({ reflect: true }) readonly size?: ButtonSizeType = 'md'

  /**
   * Specifies if the button is active or not
   */
  @Prop({ mutable: true, reflect: true }) active: boolean

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
    this.addKeyboardSpaceListener()
    if (!this.hasText && this.icon) {
      const iconTitle = unslugName(this.icon)
      if (!this.host.hasAttribute('aria-label')) {
        setAttributeIfEmpty(this.host, 'title', iconTitle)
      }
      setAttributeIfEmpty(this.host, 'aria-label', iconTitle)
    }
  }

  private checkKeyboardSpace = (event: KeyboardEvent): void => {
    if (event.code === 'Space') {
      // this.close.emit()
      // trigger click event
    }
  }

  private addKeyboardSpaceListener (): void {
    this.host.addEventListener('keydown', this.checkKeyboardSpace.bind(this))
  }

  private removeKeyboardSpaceListener (): void {
    this.host.removeEventListener('keydown', this.checkKeyboardSpace.bind(this))
  }

  disconnectedCallback (): void {
    this.removeKeyboardSpaceListener()
  }

  render () {
    this.typography = buttonSizeTypographyVariant[this.size] as TypographyType

    return (
      <Host class={clsx(!this.hasText && 'no-text')} onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} onMouseOut={this.mouseUp} tabindex="0" role="button">
        { this.icon && this.iconPosition === 'left' && <mds-icon aria-hidden="true" class="icon" name={this.icon} /> }
        { this.hasText && <mds-text class="text" part="label" typography={this.typography}><slot /></mds-text> }
        { this.hasNotification && <slot name="notification"/> }
        { this.icon && this.iconPosition === 'right' && <mds-icon aria-hidden="true" class="icon" name={this.icon} /> }
      </Host>
    )
  }
}
