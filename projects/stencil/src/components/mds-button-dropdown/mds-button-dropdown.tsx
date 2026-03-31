import { Component, Host, h, Prop } from '@stencil/core'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import { ButtonSizeType, ButtonTargetType, ButtonType, ButtonDropdownVariantType } from '@type/button'
import { ToneMinimalVariantType } from '@type/tone'

import { TypographyTruncateType } from '@type/text'

@Component({
  tag: 'mds-button-dropdown',
  styleUrl: 'mds-button-dropdown.css',
  shadow: true,
})
export class MdsButtonDropdown {

  /**
   * Specifies le text label of the component
   */
  @Prop() readonly label: string

  /**
   * Specifies if the component is focused when is loaded on the viewport
   */
  @Prop() readonly autoFocus: boolean

  /**
   * The icon displayed in the button
   */
  @Prop({ reflect: true, mutable: true }) icon?: string

  /**
   * The type of the button element
   */
  @Prop({ reflect: true }) readonly type?: ButtonType = 'submit'

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonDropdownVariantType = 'primary'

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'strong'

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
  @Prop({ mutable: true, reflect: true }) disabled?: boolean

  /**
   * Specifies if the button is awaiting for a response
   */
  @Prop({ reflect: true, mutable: true }) await?: boolean

  /**
   * Specifies the URL target of the button
   */
  @Prop({ reflect: true }) readonly href?: string

  /**
   * Specifies the target of the URL, if self or blank
   */
  @Prop() readonly target: ButtonTargetType = 'self'

  /**
   * Specifies if the text shoud be truncated or should behave as a normal text
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType = 'word'

  render () {
    return (
      <Host>
        <mds-button
          active={this.active}
          autoFocus={this.autoFocus}
          await={this.await}
          disabled={this.disabled}
          href={this.href}
          icon={this.icon}
          size={this.size}
          target={this.target}
          tone={this.tone}
          type={this.type}
          variant={this.variant}
          label={this.label}
        ></mds-button>
        <mds-button
          active={this.active}
          autoFocus={this.autoFocus}
          await={this.await}
          class="dropdown-action"
          disabled={this.disabled}
          href={this.href}
          icon={miBaselineKeyboardArrowDown}
          size={this.size}
          target={this.target}
          tone={this.tone}
          type={this.type}
          variant={this.variant}
        ></mds-button>
        <mds-dropdown target='.dropdown-action' part="dropdown">
          <slot></slot>
        </mds-dropdown>
      </Host>
    )
  }
}
