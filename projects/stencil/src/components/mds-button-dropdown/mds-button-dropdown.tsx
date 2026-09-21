import { Component, Element, Host, h, Prop } from '@stencil/core';
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg';
import {
  ButtonSizeType,
  ButtonTargetType,
  ButtonType,
  ButtonDropdownVariantType,
} from '@type/button';
import { ToneMinimalVariantType } from '@type/tone';

import { TypographyTruncateType } from '@type/text';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 */
@Component({
  tag: 'mds-button-dropdown',
  styleUrl: 'mds-button-dropdown.css',
  shadow: true,
})
export class MdsButtonDropdown {
  @Element() private readonly host!: HTMLMdsButtonDropdownElement;

  /**
   * Specifies le text label of the component
   */
  @Prop() readonly label: string;

  /**
   * Specifies if the component is focused when is loaded on the viewport
   */
  @Prop() readonly autoFocus: boolean;

  /**
   * The icon displayed in the button
   */
  @Prop({ reflect: true, mutable: true }) icon?: string;

  /**
   * The type of the button element
   */
  @Prop({ reflect: true }) readonly type?: ButtonType = 'submit';

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonDropdownVariantType = 'primary';

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'strong';

  /**
   * Specifies the size for the button
   */
  @Prop({ reflect: true }) readonly size: ButtonSizeType = 'md';

  /**
   * Specifies if the button is active or not
   */
  @Prop({ mutable: true, reflect: true }) active: boolean;

  /**
   * Specifies if the component is disabled or not
   */
  @Prop({ mutable: true, reflect: true }) disabled?: boolean;

  /**
   * Specifies if the button is awaiting for a response
   */
  @Prop({ reflect: true, mutable: true }) await?: boolean;

  /**
   * Specifies the URL target of the button
   */
  @Prop({ reflect: true }) readonly href?: string;

  /**
   * Specifies the target of the URL, if self or blank
   */
  @Prop() readonly target: ButtonTargetType = 'self';

  /**
   * Specifies if the text shoud be truncated or should behave as a normal text
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType = 'word';

  // the slot is handed straight to the `menu` of the mds-dropdown, whose children axe only
  // accepts as entries: what the consumer slots in is what has to carry the role. An
  // `mds-button` names itself a button as soon as it loads, and which of the two loads first
  // is not guaranteed, so `button` is overwritten here while any other role is left alone
  private readonly markEntries = (): void => {
    Array.from(this.host.children).forEach((entry) => {
      const role = entry.getAttribute('role');
      if (role === null || role === 'button') {
        entry.setAttribute('role', 'menuitem');
      }
    });
  };

  componentDidLoad(): void {
    this.markEntries();
    this.host.shadowRoot?.querySelector('slot')?.addEventListener('slotchange', this.markEntries);
  }

  render() {
    return (
      <Host>
        <mds-button
          active={this.active}
          autoFocus={this.autoFocus}
          class="dropdown-primary-action"
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
        <mds-dropdown target=".dropdown-action" part="dropdown">
          <slot></slot>
        </mds-dropdown>
      </Host>
    );
  }
}
