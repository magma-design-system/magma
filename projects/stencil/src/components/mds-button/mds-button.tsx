import { Component, Host, Element, h, Prop } from '@stencil/core'

import {
  ButtonType,
  ButtonSizeType,
  ButtonIconPositionType,
  ButtonVariantType,
} from '@type/button'
import { buttonSizeTypographyVariant } from './meta/variants'
import { TypographyType } from '@type/typography'
import { ToneVariantType } from '@type/variant'
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

  @Element() hostElement: HTMLMdsButtonElement

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
    this.hasText = this.hostElement.innerHTML !== ''
  }

  componentDidLoad ():void {
    if (!this.hasText && this.icon) {
      setAttributeIfEmpty(this.hostElement, 'title', unslugName(this.icon))
      setAttributeIfEmpty(this.hostElement, 'aria-label', this.hostElement.getAttribute('title'))
    }
  }

  render () {
    this.typography = buttonSizeTypographyVariant[this.size] as TypographyType

    return (
      <Host class={clsx(!this.hasText && 'no-text')} role="button" onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} onMouseOut={this.mouseUp}>
        { this.icon && this.iconPosition === 'left' && <mds-icon aria-hidden="true" class="icon" name={this.icon} /> }
        { this.hasText && <mds-text class="text" part="label" typography={this.typography}><slot /></mds-text> }
        { this.icon && this.iconPosition === 'right' && <mds-icon aria-hidden="true" class="icon" name={this.icon} /> }
      </Host>
    )
  }
}
