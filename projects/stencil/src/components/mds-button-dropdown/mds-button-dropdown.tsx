import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  State,
} from '@stencil/core';
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
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

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
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @Element() host: HTMLMdsButtonDropdownElement;

  // the primary action lives in the shadow root, where it has no form: the host takes part in it
  @AttachInternals() internals: ElementInternals;

  // the disabled state of the host as a form control: its own disabled, or a disabled fieldset
  // around it, which disables the host but not the buttons in its shadow root
  @State() private formDisabled = false;

  /**
   * Specifies le text label of the component
   */
  @Prop() readonly label: string;

  /**
   * Focuses the primary action once the component is loaded
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
   * The URL the primary action navigates to, instead of submitting; the chevron only opens the
   * menu
   */
  @Prop({ reflect: true }) readonly href?: string;

  /**
   * Where the primary action opens `href`, `'self'` or `'blank'`
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

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  private isDisabled = (): boolean => !!this.disabled || this.formDisabled;

  componentDidLoad(): void {
    // given by the host, not passed down: the inner buttons load before the host is shown, and
    // their own focus() took no effect, so autoFocus never focused anything
    if (this.autoFocus) {
      this.host.shadowRoot?.querySelector<HTMLElement>('.dropdown-primary-action')?.focus();
    }
  }

  private primaryActionClick = (): void => {
    if (this.isDisabled() || this.await) return;
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
          class="dropdown-primary-action"
          await={this.await}
          disabled={this.isDisabled()}
          href={this.href}
          icon={this.icon}
          onClick={this.primaryActionClick}
          size={this.size}
          target={this.target}
          tone={this.tone}
          variant={this.variant}
          label={this.label}
        ></mds-button>
        {/* the chevron only opens the menu: the link is the primary action's (#798) */}
        <mds-button
          active={this.active}
          aria-label={this.t.get('moreActions')}
          await={this.await}
          class="dropdown-action"
          disabled={this.isDisabled()}
          icon={miBaselineKeyboardArrowDown}
          size={this.size}
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
