import { AttachInternals, Component, Event, EventEmitter, Host, h, Prop } from '@stencil/core';
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg';
import { requestSubmitAs } from '@common/form';
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
  formAssociated: true,
})
export class MdsButtonDropdown {
  // the primary action lives in the shadow root, where it has no form: the host takes part in it
  @AttachInternals() internals: ElementInternals;

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
   * The type of the primary action: with `'submit'` or `'reset'` it submits or resets the form
   * the component is in, the chevron never does. Unlike `mds-button` it defaults to `'button'`
   */
  @Prop({ reflect: true }) readonly type?: ButtonType = 'button';

  /**
   * The name sent with `value` to the form the primary action submits, as a native submit
   * button does
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * The value sent under `name` to the form the primary action submits
   */
  @Prop({ reflect: true }) readonly value?: string;

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

  /**
   * Emits when the primary action is clicked or activated from the keyboard, unless the
   * component is disabled or awaiting. The chevron and the menu items do not emit it, while a
   * native `click` on the component also comes from the menu items
   */
  @Event({ eventName: 'mdsButtonDropdownClick' }) clickEvent: EventEmitter<void>;

  private primaryActionClick = (): void => {
    if (this.disabled || this.await) return;
    this.clickEvent.emit();

    const { form } = this.internals;
    // a link navigates instead, from the button itself
    if (!form || (this.href ?? '') !== '') return;

    if (this.type === 'submit') {
      requestSubmitAs(form, this.name, this.value);
    } else if (this.type === 'reset') {
      form.reset();
    }
  };

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
          onClick={this.primaryActionClick}
          size={this.size}
          target={this.target}
          tone={this.tone}
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
          variant={this.variant}
        ></mds-button>
        <mds-dropdown target=".dropdown-action" part="dropdown">
          <slot></slot>
        </mds-dropdown>
      </Host>
    );
  }
}
