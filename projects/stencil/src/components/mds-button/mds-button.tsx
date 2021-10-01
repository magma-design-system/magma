import { Component, Host, Element, h, Prop } from '@stencil/core'

import {
  ButtonType,
  ButtonSizeType,
  ButtonIconPositionType,
  ButtonVariantType,
} from './meta/types'
import { buttonSizeTypographyVariant } from './meta/variants'
import { TypographyType } from '../../types/typography'
import { ToneVariantType } from '../../types/variant'
import clsx from 'clsx'

@Component({
  tag: 'mds-button',
  styleUrl: 'mds-button.css',
  shadow: true,
})
export class MdsButton {

  private typography?: TypographyType
  private hasText?: boolean

  @Element() hostElement: HTMLMdsButtonElement;

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
    this.hasText = this.hostElement.querySelector('[slot="text"]') !== null
  }

  render () {
    this.typography = buttonSizeTypographyVariant[this.size] as TypographyType

    return (
      <Host class={clsx(!this.hasText && 'no-text')} onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} onMouseOut={this.mouseUp}>
        { this.icon && this.iconPosition === 'left' && <mds-icon name={this.icon} /> }
        { this.hasText && <mds-text class="text" typography={this.typography}><slot name="text"/></mds-text> }
        { this.icon && this.iconPosition === 'right' && <mds-icon name={this.icon} /> }
      </Host>
    )
  }
}
