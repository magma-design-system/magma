import { preferenceStore } from '@common/preference';
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg';
import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  h,
  State,
  Watch,
} from '@stencil/core';
import { setFormValue } from '@common/form';
import { updateValidity } from '@common/validity';
import { ThemeStatusVariantType } from '@type/variant';
import { MdsInputSelectEventDetail } from './meta/event-detail';

/**
 * @part select - The select HTML element
 * @part tip-top - Selects the verbose status of input on top of element
 * @slot - Add `option` `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-input-select',
  styleUrl: 'mds-input-select.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputSelect {
  private selectEl: HTMLSelectElement;
  // true while value takes the selection of the native select, which must not be applied back:
  // with multiple, selecting the first option alone would drop the others
  private adoptingSelection = false;
  // the value and values of the last change event, not to emit the same selection twice
  private emittedSelection?: string;
  // the value of load, which a form reset brings back as the default selection of a native select
  private loadValue?: string | number | null;
  @Element() host: HTMLMdsInputSelectElement;
  // @State() selected: boolean
  @State() hasFocus = false;
  @AttachInternals() internals: ElementInternals;

  /**
   * The accessible name of the native control: the label a screen reader announces. An
   * `mds-input-field` around the component passes its own label down here, so the attribute
   * is only written by hand when the control stands on its own. The placeholder is deliberately
   * not a fallback: it disappears as soon as the field is filled.
   */
  @Prop({ attribute: 'aria-label' }) readonly accessibleName?: string;

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop({ reflect: true }) readonly autocomplete?: 'on';

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop({ reflect: true }) readonly autoFocus?: boolean;

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop({ reflect: true }) readonly placeholder?: string;

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * If true, the element is displayed as disabled
   */
  @Prop({ reflect: true }) readonly disabled?: boolean = false;

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop({ reflect: true }) readonly required?: boolean = false;

  /**
   * Specifies if the select should allow multiple options to be selected in the list
   */
  @Prop({ reflect: true }) readonly multiple?: boolean = false;

  /**
   * When `multiple` is set to `true`, represents the number or rows in the list that should be visible
   */
  @Prop({ reflect: true }) readonly size?: number = 0;

  /**
   * Specifies the value of the component
   */
  @Prop({ reflect: true }) value?: string | number | null = '';

  /**
   * Specifies the default value of the component
   */
  @Prop({ reflect: true }) defaultValue?: string | number | null;

  /**
   * Sets the variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeStatusVariantType;

  /**
   * Emits when the selection changes: `value` is the first selected option, `values` every
   * selected one
   */
  @Event({ eventName: 'mdsInputSelectChange' })
  changeEvent: EventEmitter<MdsInputSelectEventDetail>;

  /**
   * Sets the value of the component
   */
  @Method()
  async setValue(value: string | number | null): Promise<void> {
    this.value = value;
    return Promise.resolve();
  }

  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged(): void {
    if (this.adoptingSelection) return;
    this.applySelection(false);
    this.syncSelection();
  }

  @Watch('required')
  protected requiredChanged(): void {
    this.updateFormValidity();
  }

  @Watch('name')
  protected nameChanged(): void {
    this.updateFormValue(this.selectedValues());
  }

  /** The values of the selected options, the placeholder left out. */
  private selectedValues(): string[] {
    if (this.selectEl == null) {
      return (this.value ?? '') === '' ? [] : [this.value!.toString()];
    }
    return Array.from(this.selectEl.selectedOptions)
      .filter((option) => !option.classList.contains('placeholder-option'))
      .map((option) => option.value);
  }

  /**
   * Reports the selection to the form and emits the change, once per selection: a single select
   * submits its value, a multiple one an entry per selected option under `name`, as a native
   * select.
   */
  private syncSelection(): void {
    const values = this.selectedValues();
    this.updateFormValue(values);
    this.updateFormValidity();
    const value = this.value?.toString();
    const selection = JSON.stringify([value, values]);
    if (selection === this.emittedSelection) return;
    this.emittedSelection = selection;
    this.changeEvent.emit({ value, values });
  }

  private updateFormValue(values: string[]): void {
    if (!this.multiple) {
      setFormValue(this.internals, this.value?.toString() ?? null);
      return;
    }
    const name = this.name ?? '';
    if (name === '' || values.length === 0) {
      setFormValue(this.internals, null);
      return;
    }
    const data = new FormData();
    values.forEach((value) => data.append(name, value));
    setFormValue(this.internals, data);
  }

  /**
   * Reports to the form a required select left empty: like a native `required`, it stops the
   * submit of its form.
   */
  private updateFormValidity(): void {
    const missing = this.required && (this.value ?? '') === '';
    updateValidity(this.internals, missing ? { rule: 'requiredSelect' } : undefined, this.selectEl);
  }

  @Watch('disabled')
  protected disabledChanged(newValue: boolean): void {
    /**
     * This is related to ALL disabled attributes set on Magma input components
     * if solved, please check mds-button, mds-input, mds-input-*
     * https://github.com/ionic-team/stencil/issues/5461
     */
    if (newValue) {
      setFormValue(this.internals, null);
    }
  }

  /**
   * This is for the react component because placeholder is valued after didload
   * and therefore the placeholder option is drawn as the last option.
   * Here the option is brought back to the first position
   * @param newValue placeholder new value
   * @param oldValue placeholder old value
   */
  @Watch('placeholder')
  protected placeholderChanged(newValue: string | undefined, oldValue: string | undefined) {
    if (this.selectEl == null) return;
    if (newValue != null && newValue !== '' && (oldValue ?? '') === '') {
      // the placeholder of this select, in its shadow root, not one of the page
      let defaultOption = this.placeholderOption();
      if (defaultOption) defaultOption.remove();
      defaultOption = document.createElement('option');
      defaultOption.className = 'placeholder-option';
      this.selectEl.insertBefore(defaultOption, this.selectEl.firstChild);
      defaultOption.value = '';
      defaultOption.text = newValue;
      if (
        this.defaultValue == null ||
        this.defaultValue === '' ||
        this.defaultValue === 0 ||
        Number.isNaN(this.defaultValue)
      ) {
        defaultOption.selected = true;
        this.value = undefined;
      }
      if (this.required) defaultOption.disabled = true;
    }
  }

  /**
   * Like a native select, a form reset brings the options back to the selection of the markup,
   * the placeholder when the markup selects none, and the value of load on top.
   */
  formResetCallback(): void {
    if (this.selectEl == null) return;
    const options = Array.from(this.selectEl.querySelectorAll('option'));
    options.forEach((option) => {
      option.selected = option.defaultSelected;
    });
    const placeholder = this.placeholderOption();
    if (placeholder && this.hasPlaceholder() && !options.some((option) => option.defaultSelected)) {
      placeholder.selected = true;
    }
    this.adoptingSelection = true;
    this.value = this.loadValue;
    this.adoptingSelection = false;
    this.applySelection(true);
    this.syncSelection();
  }

  componentWillLoad(): void {
    // needed for react component, this prop should be used as default-value html attributo instead of defaultValue prop
    if (
      this.defaultValue != null &&
      this.defaultValue !== '' &&
      this.defaultValue !== 0 &&
      !Number.isNaN(this.defaultValue)
    ) {
      this.value = this.defaultValue;
    }
    this.loadValue = this.value;
  }

  componentDidRender(): void {
    // the select the message points at exists from the first render on
    this.updateFormValidity();
  }

  componentDidLoad(): void {
    if (
      !this.multiple &&
      this.value != null &&
      this.value !== '' &&
      this.value !== 0 &&
      !Number.isNaN(this.value)
    ) {
      setFormValue(this.internals, this.value.toString());
    }
  }

  private onInput = () => {
    this.adoptSelection();
    this.syncSelection();
  };

  private onBlur = () => {
    this.hasFocus = false;
  };

  private onFocus = () => {
    this.hasFocus = true;
  };

  // a removed attribute or a null bound by a framework counts as no placeholder, like ''
  private hasPlaceholder = (): boolean => (this.placeholder ?? '') !== '';

  private placeholderOption = (): HTMLOptionElement | null =>
    this.selectEl?.querySelector<HTMLOptionElement>('.placeholder-option') ?? null;

  private emptyOptions = (): void => {
    const select = this.host.shadowRoot?.querySelector('select');
    const options = select?.querySelectorAll('option');

    if (!options) {
      return;
    }

    options.forEach((option: HTMLOptionElement, index: number) => {
      if (!this.hasPlaceholder()) {
        option.remove();
      }

      if (this.hasPlaceholder() && index > 0) {
        option.remove();
      }
    });
  };

  private onSlotChangeHandler = (): void => {
    const elements = this.host.shadowRoot?.querySelectorAll('slot')[0]?.assignedNodes();
    const options = this.selectEl?.querySelectorAll('option');

    if (options == null) {
      return;
    }

    if (!this.hasPlaceholder() && options.length > 0) {
      this.emptyOptions();
    }

    if (this.hasPlaceholder() && options.length > 1) {
      this.emptyOptions();
    }

    elements?.forEach((element: HTMLOptionElement) => {
      this.selectEl?.appendChild(element.cloneNode(true));
    });

    this.applySelection(true);
    this.syncSelection();
  };

  /** Sets value to the selection of the native select, without applying it back. */
  private adoptSelection(): void {
    if (this.selectEl == null) return;
    this.adoptingSelection = true;
    this.value = this.selectEl.value;
    this.adoptingSelection = false;
  }

  /**
   * Applies value to the options. A value selects its option alone, as `select.value` does, with
   * `multiple` too. Without a value, the select keeps the options the markup selects, or its own
   * default, when `fromMarkup`; a value cleared by code clears the selection instead, down to the
   * placeholder or, without one, the first option a single select falls back to.
   */
  private applySelection(fromMarkup: boolean): void {
    if (this.selectEl == null) return;
    if (this.value != null && this.value !== '' && this.value !== 0 && !Number.isNaN(this.value)) {
      this.selectEl.querySelectorAll('option').forEach((element: HTMLOptionElement) => {
        element.selected = element.value === this.value;
      });
      return;
    }
    if (fromMarkup) {
      this.adoptSelection();
      return;
    }
    this.selectEl.querySelectorAll('option').forEach((element: HTMLOptionElement) => {
      element.selected = false;
    });
    const placeholder = this.placeholderOption();
    if (placeholder && this.hasPlaceholder()) placeholder.selected = true;
    this.adoptSelection();
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <select
          aria-label={this.accessibleName}
          class="input"
          onInput={this.onInput}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          name={this.name}
          required={this.required}
          disabled={this.disabled}
          multiple={this.multiple}
          size={this.size}
          part="select"
          ref={(el) => (this.selectEl = el as HTMLSelectElement)}
        >
          <option
            class="placeholder-option"
            value=""
            disabled={!this.required ? undefined : true}
            selected={
              this.defaultValue != null &&
              this.defaultValue !== '' &&
              this.defaultValue !== 0 &&
              !Number.isNaN(this.defaultValue)
                ? undefined
                : true
            }
          >
            {this.placeholder}
          </option>
        </select>
        <div class="icon-container">
          <mds-icon class="icon" name={miBaselineKeyboardArrowDown} />
        </div>
        <div class="option-container">
          <slot onSlotchange={this.onSlotChangeHandler}></slot>
        </div>
        <mds-input-tip position="top" active={this.hasFocus} part="tip-top">
          {this.disabled && <mds-input-tip-item expanded variant="disabled"></mds-input-tip-item>}
          {this.required && (
            <mds-input-tip-item
              expanded={this.hasFocus}
              variant={(this.value ?? '') === '' ? 'required' : 'required-success'}
            ></mds-input-tip-item>
          )}
        </mds-input-tip>
      </Host>
    );
  }
}
