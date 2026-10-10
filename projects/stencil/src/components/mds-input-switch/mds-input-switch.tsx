import clsx from 'clsx';
import miBaselineChecked from '@icon/mgg/check-small.svg';
import miBaselineRemove from '@icon/mi/baseline/remove.svg';
import {
  AttachInternals,
  Component,
  Element,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  State,
  Watch,
} from '@stencil/core';
import { setFormValue } from '@common/form';
import { InputSwitchType, InputSwitchSizeType } from './meta/types';
import { KeyboardManager } from '@common/keyboard-manager';
import { MdsInputSwitchEventDetail } from './meta/event-detail';
import { TypographyInfoType, TypographyReadType, TypographyVariants } from '@type/typography';
import { inputSwitchIconVariant } from './meta/variants';
import { hasSlotted } from '@common/slot';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Put text string or elements here
 */

@Component({
  tag: 'mds-input-switch',
  styleUrl: 'mds-input-switch.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputSwitch {
  @AttachInternals() internals: ElementInternals;

  // the disabled state of the host as a form control: its own disabled, or a disabled fieldset
  // around it, which disables the host but not the native control in its shadow root
  @State() private formDisabled = false;
  @Element() host: HTMLMdsInputSwitchElement;
  private km = new KeyboardManager();
  private label: string;
  // the checked state of load, which a form reset brings back as the checked attribute of a
  // native input
  private loadChecked = false;
  @State() dirty = false;
  @State() hasText: boolean = false;

  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Sets or returns whether a checkbox should automatically
   * get focus when the page loads
   */
  @Prop({ reflect: true }) readonly autofocus: boolean;

  /**
   * Specifies that an <input> element should be pre-selected
   * when the page loads (for type="checkbox" or type="radio")
   */
  @Prop({ mutable: true, reflect: true }) checked?: boolean;

  /**
   * Sets or returns whether a checkbox is disabled, or not
   */
  @Prop({ reflect: true, mutable: true }) disabled?: boolean;

  /**
   * Sets if the type switch mode shows explicit icons
   */
  @Prop({ reflect: true }) explicit?: boolean;

  /**
   * The checked icon displayed
   */
  @Prop({ reflect: true }) readonly icon: string = '';

  /**
   * Sets or returns the indeterminate state of the checkbox
   */
  @Prop({ reflect: true, mutable: true }) indeterminate?: boolean;

  /**
   * Specifies the name of an <input> element
   */
  @Prop({ reflect: true }) readonly name: string = '';

  /**
   * Specifies the size for the switch toggle, it works only if attribute 'type' is set to 'switch'
   */
  @Prop({ reflect: true }) readonly size: InputSwitchSizeType = 'md';

  /**
   * Specifies switch type: switch (default), checkbox and radio
   */
  @Prop({ reflect: true }) readonly type: InputSwitchType = 'switch';

  /**
   * Specifies the font typography of the element
   */
  @Prop({ reflect: true }) readonly typography?: TypographyInfoType | TypographyReadType = 'detail';

  /**
   * Specifies the variant for `typography`
   */
  @Prop({ reflect: true }) readonly variant?: TypographyVariants;

  /**
   * Specifies the value of the input element
   */
  @Prop({ mutable: true, reflect: true }) value?: string = '';

  /**
   * Emits when the value changes
   */
  @Event({ eventName: 'mdsInputSwitchChange' })
  changeEvent: EventEmitter<MdsInputSwitchEventDetail>;

  /**
   * Unchecks the other radios of the group, as a native radio does: the same name in the same
   * form and the same tree. A radio without a name is a group of its own.
   */
  private uncheckSiblings = (): void => {
    if ((this.name ?? '') === '') return;
    const root = this.host.getRootNode() as Document | ShadowRoot;
    const form = this.host.closest('form');
    root
      .querySelectorAll<HTMLMdsInputSwitchElement>('mds-input-switch[type="radio"]')
      .forEach((element) => {
        if (
          element !== this.host &&
          element.name === this.name &&
          element.closest('form') === form
        ) {
          element.checked = false;
        }
      });
  };

  /** Submits the value while checked and enabled, nothing otherwise, as a native input. */
  private updateFormValue(): void {
    setFormValue(this.internals, this.checked && !this.disabled ? (this.value ?? null) : null);
  }

  private handleInputOnChange = (e: Event): void => {
    const { value } = e.target as HTMLInputElement;
    e.preventDefault();
    e.stopPropagation();
    const input = this.host.shadowRoot?.getElementById('field') as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = false;

    this.changeEvent.emit({ name: this.name, checked: this.checked, value });
  };

  private handleDirty = (): void => {
    this.dirty = true;
  };

  private checkFocusElement = (): void => {
    // the native input is the focusable control: Space toggles it natively, Enter through the manager
    this.km.addElement(this.host.shadowRoot?.querySelector('.field') as HTMLElement);
    this.km.attachClickBehavior();
  };

  @Watch('disabled')
  protected disabledChanged(newValue?: boolean): void {
    /**
     * This is related to ALL disabled attributes set on Magma input components
     * if solved, please check mds-button, mds-input, mds-input-*
     * https://github.com/ionic-team/stencil/issues/5461
     */
    if (newValue === false) {
      // the watcher runs again with undefined
      this.disabled = undefined;
      return;
    }
    this.updateFormValue();
  }

  /**
   * The form value follows every change of checked, by the user or by code; a radio checked
   * unchecks the others of its group, which clear their own form value.
   */
  @Watch('checked')
  protected checkedChanged(newValue?: boolean): void {
    if (newValue === false) {
      // the watcher runs again with undefined
      this.checked = undefined;
      return;
    }
    if (newValue && this.type === 'radio') this.uncheckSiblings();
    this.updateFormValue();
  }

  @Watch('value')
  protected valueChanged(): void {
    this.updateFormValue();
  }

  @Watch('explicit')
  protected explicitChanged(newValue?: boolean): void {
    if (newValue === false) {
      this.explicit = undefined;
    }
  }

  /** Like a native checkbox or radio, a form reset brings back the checked state of load. */
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  private isDisabled = (): boolean => !!this.disabled || this.formDisabled;

  formResetCallback(): void {
    this.checked = this.loadChecked ? true : undefined;
    this.updateFormValue();
  }

  componentWillLoad(): void {
    this.loadChecked = this.checked === true;
  }

  componentDidLoad(): void {
    this.label = this.host.textContent ?? '';
    this.updateFormValue();
    this.checkFocusElement();
    this.hasText = hasSlotted(this.host);
  }

  render() {
    const { iconChecked, iconUnchecked, iconIndeterminate } = inputSwitchIconVariant[this.type];
    const iconCheckedUser = this.icon !== '' ? this.icon : iconChecked;

    return (
      <Host
        onClick={this.handleDirty}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <input
          aria-label={this.t.get(this.checked ? 'unselect' : 'select', { label: this.label })}
          autoFocus={this.autofocus}
          checked={this.checked}
          class="field"
          disabled={this.isDisabled()}
          id="field"
          indeterminate={this.indeterminate}
          name={this.name}
          onChange={this.handleInputOnChange}
          role={this.type === 'switch' ? 'switch' : undefined}
          type={this.type === 'switch' ? 'checkbox' : this.type}
          value={this.value ?? undefined}
        />
        {this.type === 'switch' ? (
          <label htmlFor="field" class={clsx('switch-container', this.dirty !== false && 'dirty')}>
            <div class="switch">
              <div class="switch-toggle">
                {this.explicit && (
                  <mds-icon
                    class="icon-explicit"
                    name={this.checked ? miBaselineChecked : miBaselineRemove}
                  ></mds-icon>
                )}
              </div>
            </div>
          </label>
        ) : (
          <label htmlFor="field" class="label-icon">
            <mds-text
              class="icon-typography-unchecked"
              tag="div"
              typography={this.typography}
              variant={this.variant}
            >
              <mds-icon
                class="icon-unchecked"
                name={clsx(this.indeterminate ? iconIndeterminate : iconUnchecked)}
              />
            </mds-text>
            {this.checked && (
              <mds-text
                class="icon-typography-checked"
                tag="div"
                typography={this.typography}
                variant={this.variant}
              >
                <mds-icon
                  class="icon-checked"
                  name={clsx(this.indeterminate ? iconIndeterminate : iconCheckedUser)}
                />
              </mds-text>
            )}
          </label>
        )}
        <label htmlFor="field" class={clsx('label-text', !this.hasText && 'label-text--empty')}>
          <mds-text tag="p" typography={this.typography} variant={this.variant}>
            <slot></slot>
          </mds-text>
        </label>
      </Host>
    );
  }
}
