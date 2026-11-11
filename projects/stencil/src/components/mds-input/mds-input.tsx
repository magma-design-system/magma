import clsx from 'clsx';
import mggAiChatbotOutline from '@icon/mgg/ai-chatbot-outline.svg';
import miBaselineAdd from '@icon/mi/baseline/add.svg';
import miBaselineArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg';
import miBaselineArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg';
import miBaselineRemove from '@icon/mi/baseline/remove.svg';
import miBaselineVisible from '@icon/mi/baseline/visibility.svg';
import miBaselineVisibleOff from '@icon/mi/baseline/visibility-off.svg';
import miOutlineMic from '@icon/mi/outline/mic.svg';
import miOutlineMicOff from '@icon/mi/outline/mic-off.svg';
import miOutlinePalette from '@icon/mi/outline/palette.svg';
import miBaselineDone from '@icon/mi/baseline/done.svg';
import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  Watch,
  Listen,
  h,
} from '@stencil/core';
import { setFormValue } from '@common/form';
import { updateValidity } from '@common/validity';
import { AutocompleteType } from '@type/autocomplete';
import {
  InputTextType,
  InputControlsLayoutType,
  InputControlsIconType,
  InputSizeType,
  MdsInputEventDetail,
} from '@type/input';
import { ThemeInputVariantType } from '@type/variant';
import { TypographyInputType } from '@type/typography';
import { InputTipItemVariantType } from '@type/input-tip';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import {
  createInputValidationManager,
  InputValidationManager,
} from './meta/input-type/InputValidationManager';
import {
  maxLengthValidator,
  maxValidator,
  MdsValidationErrors,
  MdsValidatorFn,
  minLengthValidator,
  minValidator,
  patternValidator,
  requiredValidor,
} from './meta/validators';
import { validityProblem } from './meta/validity';
import { toSimpleColor } from './meta/color';
import { hashRandomValue } from '@common/aria';
import { preferenceStore } from '@common/preference';

export interface MdsInputInterface {
  autocomplete?: AutocompleteType;
  autofocus?: boolean;
  controlsIcon?: InputControlsIconType;
  controlsLayout?: InputControlsLayoutType;
  datalist?: string[];
  disabled?: boolean;
  icon?: string;
  max?: string;
  maxLength?: number;
  min?: string;
  minLength?: number;
  name?: string;
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  step?: string;
  tabindex?: number;
  tip?: string;
  type: InputTextType;
  typography?: TypographyInputType;
  value?: string;
  variant?: ThemeInputVariantType;
}

/**
 * @part color-picker-button - Selects the button that opens the colour picker of a `color` field
 * @part counter-button-decrease - Selects the button used to decrease the input value
 * @part counter-button-increase - Selects the button used to increase the input value
 * @part field - Selects the native input field used by the component
 * @part mic-toggle-button - Selects the button that starts and stops the speech to text
 * @part password-toggle-button - Selects the button used to show or hide password
 * @part password-mask-items - Selects the items wrapper used to mask the password
 * @part password-mask-item - Selects the item used to mask the password
 * @part tip-count - Selects the mds-input-tip-item shown when maxlength attribute is set, can be used to hide it if needed
 * @part tip-top - Selects the verbose status of input on top of element
 * @part tip-bottom - Selects the verbose status of input on bottom of element
 * @category forms
 */
@Component({
  tag: 'mds-input',
  styleUrl: 'mds-input.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInput {
  private nativeInput?: HTMLInputElement | HTMLTextAreaElement;
  private tabindex?: number;
  // the value at load, which a form reset brings back as the value attribute of a native input
  private defaultValue = '';

  // replaced by buildValidation on load, a valid empty set before
  private inputValidation: InputValidationManager = createInputValidationManager('text');
  // the validators added through addValidator, kept apart so that a rebuild of the rules keeps them
  private customValidators: MdsValidatorFn[] = [];
  private isValid: boolean;
  // true once a blur has validated the field and driven its variant
  private validated = false;
  private speechToTextLabelKey: string = 'speechToTextOn';
  private speechToTextIcon: string = miOutlineMic;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any;
  private speechButton: HTMLMdsButtonElement;
  // the picker of the platform a colour field opens from its swatch, hidden under it
  private colorPicker?: HTMLInputElement;

  private datalistId: string;
  @Element() el: HTMLMdsInputElement;
  @State() hasFocus = false;
  @State() isRecording: boolean = false;
  @State() currentLengthLabel: string;
  @State() countVariant: InputTipItemVariantType = 'count-empty';
  @State() isPasswordVisible = false;
  // the text of a colour field: what the user typed, which `value` holds only once it is a colour
  @State() private colorText = '';

  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @AttachInternals() internals: ElementInternals;

  // the disabled state of the host as a form control: its own disabled, or a disabled fieldset
  // around it, which disables the host but not the native control in its shadow root
  @State() private formDisabled = false;

  /**
   * The accessible name of the native control: the label a screen reader announces. An
   * `mds-input-field` around the component passes its own label down here, so the attribute
   * is only written by hand when the input stands on its own. The placeholder is deliberately
   * not a fallback: it disappears as soon as the field is filled.
   */
  @Prop({ attribute: 'aria-label' }) readonly accessibleName?: string;

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @Prop({ reflect: true }) readonly autocomplete?: AutocompleteType = 'off';

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @Prop({ reflect: true }) readonly autofocus: boolean = false;

  /**
   * Specifies if the spinner icon is shown, replacing the icon if present. A `color` field keeps
   * its swatch, which shows the value, and shows the spinner at its end, before the picker button
   * (read-only or disabled, the field has no picker button and the spinner takes the end)
   */
  @Prop({ reflect: true }) readonly await: boolean = false;

  /**
   * Specifies the layout of the counter button when the input type is set to `number`
   */
  @Prop({ reflect: true }) readonly controlsLayout?: InputControlsLayoutType = 'vertical';

  /**
   * Specifies the icon type of the counter button when the input type is set to `number`
   */
  @Prop({ reflect: true }) readonly controlsIcon?: InputControlsIconType = 'arrow';

  /**
   * A list of search terms to be searched from the input field,
   * it should be used with type="search" input.
   */
  @Prop() readonly datalist?: string[];

  /**
   * If true, the element is displayed as disabled
   */
  @Prop({ reflect: true }) readonly disabled?: boolean = false;

  /**
   * An icon displayed at the left of the input, inside the field; the spinner of `await` takes
   * its place. A `color` field ignores it: its swatch stands there, one mark at the start
   */
  @Prop({ mutable: true, reflect: true }) icon?: string;

  /**
   * Specifies the maximum value, with `type="number"` or `type="date"`: a number, or a date in ISO
   * format (YYYY-MM-DD) such as `2046-12-04`
   * @example '180'
   */
  @Prop({ reflect: true }) readonly max?: string | number;

  /**
   * Specifies the maximum number of characters allowed in an element.
   * Use it with input type="text".
   * If maxlength is set to 0 or a negative number it will be considered as undefined.
   */
  @Prop({ reflect: true, mutable: true }) maxlength?: number;

  /**
   * Toggles text recognition. A read-only or disabled field has no dictation button. A `color`
   * field ignores it: a colour code is typed or picked, not dictated, and its end holds the button
   * of the picker
   */
  @Prop({ reflect: true }) readonly mic?: boolean;

  /**
   * Specifies the minimum value, with `type="number"` or `type="date"`: a number, or a date in ISO
   * format (YYYY-MM-DD) such as `1988-04-15`
   * @example '-3'
   */
  @Prop({ reflect: true }) readonly min?: string | number;

  /**
   * Specifies the minimum number of characters allowed in an element
   * use it with input type="number"
   */
  @Prop({ reflect: true }) readonly minlength?: number;

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * Specifies a regular expression the whole value has to match, as the pattern attribute of a
   * native input: a value that does not match stops the submit of the form
   * @example '[0-9]{5}'
   */
  @Prop({ reflect: true }) readonly pattern?: string;

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop({ reflect: true }) readonly placeholder?: string;

  /**
   * Specifies that the element is read-only
   */
  @Prop({ reflect: true }) readonly readonly?: boolean = false;

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop({ reflect: true }) readonly required?: boolean = false;

  /**
   * Sets the variant of the input field
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeInputVariantType = 'primary';

  /**
   * Sets the word(s) of the tip of the input field
   */
  @Prop({ reflect: true }) readonly tip?: string;

  /**
   * Specifies the height of the field, the same as `mds-button`: `sm` 28px, `md` 36px, `lg` 48px.
   * A textarea keeps its own height (`--mds-input-textarea-min-height`)
   */
  @Prop({ reflect: true }) readonly size?: InputSizeType = 'lg';

  /**
   * Specifies the interval between legal numbers in an input field
   * @example '0.01'
   */
  @Prop({ reflect: true }) readonly step?: string;

  /**
   * Specifies the type of input element. `color` holds a colour: the field stays a text field,
   * where the code is typed and validated, with a swatch of the colour at its start and a button
   * at its end that opens the colour picker of the platform. Its value, in the change event and
   * in the form, is the colour as
   * `#rrggbb` in lower case, or `''` while the text is empty or names no colour, which is a
   * validation error; the text also takes `#rgb` and the code without `#`, in any case, and is
   * written back as `#rrggbb` when the field is left
   */
  @Prop({ reflect: true }) readonly type?: InputTextType = 'text';

  /**
   * Specifies the typography of input element
   */
  @Prop({ reflect: true }) typography: TypographyInputType = 'detail';

  /**
   * Specifies the value of the input element. With `type="color"`, a colour as `#rrggbb`: a value
   * set as `#rgb`, without `#` or in upper case is written so, and one that names no colour is
   * shown as it is, with its error, while the value becomes `''`
   */
  @Prop({ mutable: true, reflect: true }) value: string = '';

  /**
   * Emits an InputChangeEventDetail when the value of the input element changes
   */
  @Event({ eventName: 'mdsInputChange' }) changeEvent!: EventEmitter<MdsInputEventDetail>;

  /**
   * Emits a KeyboardEvent when a keyboard key is pressed on the focused input element
   */
  @Event({ eventName: 'mdsInputKeydown' }) keyDownEvent!: EventEmitter<KeyboardEvent>;

  /**
   * Emits a void event when input element is blurred
   */
  @Event({ eventName: 'mdsInputBlur' }) blurEvent!: EventEmitter<void>;

  /**
   * Emits a void event when input element is focused
   */
  @Event({ eventName: 'mdsInputFocus' }) focusEvent!: EventEmitter<void>;

  /**
   * Emits a void event when input speech recognition ends
   */
  @Event({ eventName: 'mdsInputSpeechEnd' }) speechEvent!: EventEmitter<void>;

  /**
   * Emits a boolean event when a input execute validation
   */
  @Event({ eventName: 'mdsInputValidation' }) validationEvent!: EventEmitter<boolean>;

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    this.stopLockedDictation();
  }

  private isDisabled = (): boolean => !!this.disabled || this.formDisabled;

  // the user can change the value: the buttons that change it (steppers, mic) follow it
  private canEdit = (): boolean => !this.isDisabled() && !this.readonly;

  /**
   * Like a native input, a form reset brings back the value of load and forgets the validation
   * shown on blur: the field looks pristine until the next blur.
   */
  formResetCallback(): void {
    const validated = this.validated;
    this.validated = false;
    if (this.isColor()) this.showColor(this.defaultValue);
    else this.value = this.defaultValue;
    this.isValid = !(this.required && this.checkedValue() === '');
    if (validated) this.variant = 'primary';
  }

  connectedCallback(): void {
    this.datalistId = `datalist-${hashRandomValue()}`;
  }

  componentWillLoad(): void {
    this.defaultValue = this.value ?? '';

    // If the mds-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // mds-input to avoid causing tabbing twice on the same element
    if (this.el.hasAttribute('tabindex')) {
      const tabindex = this.el.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? parseInt(tabindex) : undefined;
      this.el.removeAttribute('tabindex');
    }
    if (this.isColor()) this.showColor(this.defaultValue);
    setFormValue(this.internals, this.value ?? null);
    this.maxLengthChanged(this.maxlength);
    this.buildValidation();
    this.isValid = !(this.required && this.checkedValue() === '');
  }

  /** A colour field (`type="color"`): its text is typed and validated, its value is its colour. */
  private isColor = (): boolean => this.type === 'color';

  /**
   * What the validators check: the value, or the text of a colour field while it names no colour
   * (its value is `''` then), so that it fails the colour validator instead of passing for an
   * empty field.
   */
  private checkedValue(): string {
    const value = this.value ?? '';
    return this.isColor() && value === '' ? this.colorText.trim() : value;
  }

  /**
   * Shows a text in a colour field and takes its colour as the value, as at load and on reset: a
   * colour written as `#rrggbb`, any other text as it is, with the value `''`.
   */
  private showColor(text: string): void {
    const color = toSimpleColor(text);
    this.colorText = color || text;
    this.value = color;
  }

  /**
   * Keeps the text of a colour field with its value when the value changes. The value of the text
   * leaves the text alone, as the user typed it until they leave the field; any other comes from
   * outside (code, a framework) and is shown, as `#rrggbb` when it is a colour. A value that is
   * no `#rrggbb` is set again to its colour, or to `''`, as a native input sanitizes its value
   * (HTML, value sanitization of the color and number types). Returns true when it sets the value
   * again, whose watcher goes on in its place.
   */
  private syncColorText(): boolean {
    const value = this.value ?? '';
    if (toSimpleColor(this.colorText) === value) return false;
    const color = toSimpleColor(value);
    this.colorText = color || value;
    if (color === value) return false;
    this.value = color;
    return true;
  }

  componentDidLoad(): void {
    if (this.autofocus) {
      this.nativeInput?.focus();
    }
    this.variantChanged(this.variant ?? 'primary');
  }

  componentDidRender(): void {
    // after every render: the native control the message points at can be a new element
    this.updateFormValidity();
  }

  /**
   * Builds the validators from scratch: the ones of the type, the ones of the constraint props and
   * the custom ones. A rebuild instead of an append, so that a rule changed after load replaces
   * the old one instead of stacking on it.
   */
  private buildValidation(): void {
    const validation = createInputValidationManager(this.type ?? 'text');
    const { validator } = validation;
    const max = this.numericBound(this.max);
    const min = this.numericBound(this.min);
    if (this.required) validator.addValidator(requiredValidor);
    if (max !== undefined) validator.addValidator(maxValidator(max));
    if (min !== undefined) validator.addValidator(minValidator(min));
    if (this.maxlength !== undefined && this.maxlength !== 0 && !Number.isNaN(this.maxlength))
      validator.addValidator(maxLengthValidator(this.maxlength));
    if (this.minlength !== undefined && this.minlength !== 0 && !Number.isNaN(this.minlength))
      validator.addValidator(minLengthValidator(this.minlength));
    const pattern = this.patternApplies() ? patternValidator(this.pattern ?? '') : null;
    if (pattern) validator.addValidator(pattern);
    validator.addValidator(this.customValidators);
    this.inputValidation = validation;
  }

  /**
   * As on a native input, `pattern` constrains the text types, not a number, a date, a time or a
   * colour, whose format is fixed.
   */
  private patternApplies(): boolean {
    return (
      (this.pattern ?? '') !== '' &&
      !['color', 'date', 'number', 'textarea', 'time'].includes(this.type ?? 'text')
    );
  }

  /** The number held by `min` or `max`, `undefined` when the prop is unset or not a number. */
  private numericBound(bound?: string | number | null): number | undefined {
    if (bound === undefined || bound === null || bound === '') return undefined;
    const value = Number(bound);
    return Number.isNaN(value) ? undefined : value;
  }

  /**
   * Reports the validity of the value to the form, decided by the same validators that drive the
   * variant: like a native `required`, an invalid field stops the submit of its form. Runs on every
   * change of the value or of the rules, not on blur: the form can be submitted without a blur.
   */
  private updateFormValidity(): void {
    const errors = this.inputValidation.validator.check(this.checkedValue());
    const problem = errors
      ? validityProblem(errors, {
          max: this.numericBound(this.max),
          maxlength: this.maxlength,
          min: this.numericBound(this.min),
          minlength: this.minlength,
        })
      : undefined;
    updateValidity(this.internals, problem, this.nativeInput);
  }

  /**
   * A submit stopped by an invalid field, or a `checkValidity()` of its form, validates the field
   * as a blur does, so that it shows what is wrong.
   */
  @Listen('invalid')
  protected invalidHandler(): void {
    this.validateInput();
  }

  /**
   * Rebuilds the validators when a prop they derive from changes after load, as it does with the
   * React wrappers under SSR, which set the props on an element that has already loaded.
   */
  @Watch('max')
  @Watch('maxlength')
  @Watch('min')
  @Watch('minlength')
  @Watch('pattern')
  @Watch('required')
  @Watch('type')
  protected validationRulesChanged(): void {
    this.buildValidation();
    this.updateFormValidity();
    if (!this.validated) {
      // pristine field: only the required tip follows, the variant waits for the first blur
      this.isValid = !(this.required && this.checkedValue() === '');
      return;
    }
    if (this.inputValidation.validator.hasValidator()) {
      this.validateInput();
      return;
    }
    // the last rule is gone: nothing is left to drive the variant, back to the pristine look
    this.validated = false;
    this.isValid = true;
    this.variant = 'primary';
  }

  /** A field that becomes a colour field shows its value as its text, and takes its colour. */
  @Watch('type')
  protected typeChanged(): void {
    if (this.isColor()) this.showColor(this.value ?? '');
  }

  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged(): void {
    if (this.isColor() && this.syncColorText()) return;
    this.changeEvent.emit({ value: this.value });
    setFormValue(this.internals, this.value ?? null);
    this.followValue();
  }

  /**
   * What follows a change of what the field holds: its value, or the text of a colour field,
   * which can change while the value stays `''`.
   */
  private followValue(): void {
    this.updateFormValidity();
    if (this.maxlength !== undefined) {
      this.countMaxLength();
    }
    if (!this.validated) {
      // pristine field: only the required tip follows, the variant waits for the first blur
      this.isValid = !(this.required && this.checkedValue() === '');
      return;
    }
    // if is necessary for skip validation when reset input to retype correct value, validation is always onBlur
    if (this.checkedValue() === '') return;
    if (!this.isValid) this.validateInput();
  }

  @Watch('variant')
  protected variantChanged(newValue: ThemeInputVariantType): void {
    if (newValue === 'ai' && this.icon === undefined) {
      this.icon = mggAiChatbotOutline;
    }
  }

  @Watch('maxlength')
  private maxLengthChanged(newValue?: number): void {
    if (newValue === undefined) return;
    if (newValue <= 0) {
      this.maxlength = undefined;
      return;
    }
    this.countMaxLength();
  }

  /**
   * Adds a validator to the input.
   * @param validator the validator function to add
   */
  @Method()
  async addValidator(validator: MdsValidatorFn): Promise<void> {
    this.customValidators.push(validator);
    this.inputValidation.validator.addValidator(validator);
    this.updateFormValidity();
    return Promise.resolve();
  }

  /**
   * Removes a previously added validator from the input.
   * @param validator the validator function to remove
   */
  @Method()
  async removeValidator(validator: MdsValidatorFn): Promise<void> {
    this.customValidators = this.customValidators.filter((custom) => custom !== validator);
    this.inputValidation.validator.removeValidator(validator);
    this.updateFormValidity();
  }

  /**
   * Returns if validator is presen
   * @param validator validator to check if it is present
   * @returns if a validator is present or not, if no validator given, return if there are at least one validator
   */
  @Method()
  async hasValidator(validator?: MdsValidatorFn): Promise<boolean> {
    return this.inputValidation.validator.hasValidator(validator);
  }

  /**
   * Returns the current validation errors, or `null` if the value is valid.
   * @returns the validation errors, or `null` when valid
   */
  @Method()
  async getErrors(): Promise<MdsValidationErrors | null> {
    return Promise.resolve(this.inputValidation.validator.errors);
  }

  private validateInput(): boolean {
    // validate input only when atleast one validator is present
    if (this.inputValidation.validator.hasValidator()) {
      this.validated = true;
      this.isValid = this.inputValidation.isValid(this.checkedValue());

      // set variant attribute
      if (this.checkedValue() === '' && !this.required) this.variant = 'primary';
      else this.variant = this.isValid ? 'success' : 'error';

      this.validationEvent.emit(this.isValid);
    }
    return this.isValid;
  }

  private countMaxLength = (): void => {
    if (this.maxlength === undefined || this.maxlength === 0 || Number.isNaN(this.maxlength))
      return;
    if (this.value === undefined) return;

    this.currentLengthLabel = `${this.value?.length ?? 0} / ${this.maxlength}`;

    const completionPerc = Math.round((this.value.length * 100) / this.maxlength);

    if (this.value?.length === this.maxlength) {
      this.countVariant = 'count-full';
      return;
    }

    if (completionPerc >= 100) {
      this.countVariant = 'count-full';
      return;
    }

    if (completionPerc >= 75) {
      this.countVariant = 'count-almost-full';
      return;
    }
    if (completionPerc >= 50) {
      this.countVariant = 'count-almost';
      return;
    }
    if (completionPerc >= 25) {
      this.countVariant = 'count-incomplete';
      return;
    }
    this.countVariant = 'count-empty';
  };

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
    this.stopLockedDictation();
  }

  @Watch('readonly')
  protected readonlyChanged(): void {
    this.stopLockedDictation();
  }

  /**
   * A field that becomes read-only or disabled loses its dictation button, with which the user
   * would stop a dictation: one in progress stops at once, emitting `mdsInputSpeechEnd`.
   */
  private stopLockedDictation(): void {
    if (this.isRecording && !this.canEdit()) this.toggleTextRecognition();
  }

  /**
   * Sets focus on the specified `my-input`.
   * Use this method instead
   * of the global `input.focus()`.
   */
  @Method()
  async setFocus(): Promise<void> {
    if (this.nativeInput) {
      this.nativeInput.focus();
    }
  }

  /**
   * Returns the native `<input>` element used under the hood.
   */
  @Method()
  getInputElement(): Promise<HTMLInputElement | HTMLTextAreaElement> {
    return Promise.resolve(this.nativeInput!);
  }

  private onInput = (ev: InputEvent) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement | false;
    if (input && this.isColor()) {
      this.typeColor(input.value);
      return;
    }
    if (input) {
      this.value = input.value;
      setFormValue(this.internals, this.value);
    }
  };

  /**
   * The text of a colour field, typed or picked: the value becomes its colour, or `''`, and its
   * watcher follows; a text that leaves the value as it was is followed here.
   */
  private typeColor(text: string): void {
    this.colorText = text;
    const color = toSimpleColor(text);
    if (color !== (this.value ?? '')) {
      this.value = color;
      return;
    }
    this.followValue();
  }

  /**
   * Opens the colour picker of the platform from its button, or from the swatch with the pointer,
   * on a field the user can change. The picker always holds a colour: black for an empty field,
   * the default of a native colour input.
   */
  private openColorPicker = (): void => {
    const picker = this.colorPicker;
    if (!picker || !this.canEdit()) return;
    picker.value = this.value || '#000000';
    try {
      picker.showPicker();
    } catch {
      // a browser without showPicker opens the picker of a colour input on a click
      picker.click();
    }
  };

  /** The colour picked writes the text and the value, as if typed: the same events follow. */
  private onColorPick = (ev: Event): void => {
    if (!this.canEdit()) return;
    this.typeColor((ev.target as HTMLInputElement).value);
  };

  private onKeyDown = (ev: KeyboardEvent) => {
    this.keyDownEvent.emit(ev);
  };

  private onBlur = () => {
    this.hasFocus = false;
    // a colour field writes the colour typed as the form gets it, #rrggbb, once the user leaves
    if (this.isColor() && this.value) this.colorText = this.value;
    this.validateInput();
    this.blurEvent.emit();
    // this.isValidInput = this.validateInput()
  };

  private onFocus = (ev: Event) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement;
    this.hasFocus = true;
    this.focusEvent.emit();
    if (this.readonly) {
      // setTimeout to avoid Safari 14.1.2
      // to unselect text when mouse is clicked slowly
      setTimeout(() => {
        input.select();
      }, 10);
    }
  };

  private stepUp = () => {
    if (this.nativeInput && this.canEdit()) {
      (this.nativeInput as HTMLInputElement).stepUp();
      this.value = this.nativeInput.value;
    }
  };

  private stepDown = () => {
    if (this.nativeInput && this.canEdit()) {
      (this.nativeInput as HTMLInputElement).stepDown();
      this.value = this.nativeInput.value;
    }
  };

  private toggleTextRecognition = (): void => {
    // a dictation can always be stopped, started only where the user can change the value
    if (!this.isRecording && !this.canEdit()) return;
    this.isRecording = !this.isRecording;

    if (!this.isRecording) {
      this.speechToTextLabelKey = 'speechToTextOn';
      this.speechToTextIcon = miOutlineMic;
      this.stopRecognition();
      return;
    }

    this.speechToTextLabelKey = 'speechToTextOff';
    this.speechToTextIcon = miBaselineDone;
    this.startRecognition();
  };

  private readonly handlePasswordToggleClick = (): void => {
    this.isPasswordVisible = !this.isPasswordVisible;
  };

  private onSpeechRecognitionError = (): void => {
    console.error('SpeechRecognition API may not work properly on Chrome based browsers.');
    this.speechButton.classList.remove('mic-toggle-button--recording');
    this.speechButton.classList.add('toggle-button--error');
    this.isRecording = false;
    this.speechToTextLabelKey = 'speechToTextError';
    this.speechToTextIcon = miOutlineMicOff;
  };

  private startRecognition = (): void => {
    if (this.speechButton == null) {
      this.speechButton = this.el?.shadowRoot?.querySelector(
        '.mic-toggle-button',
      ) as HTMLMdsButtonElement;
    }
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.onSpeechRecognitionError();
      return;
    }
    // the dictation replaces the value, once it can start
    this.value = '';

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.lang = navigator.language || 'it-IT';
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    let transcript = '';
    let progress = 0; // need to save position progress on speech results

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      // the field was disabled or made read-only while dictating
      if (!this.canEdit()) {
        if (this.isRecording) this.toggleTextRecognition();
        return;
      }
      const speechResult = event.results;
      const interimResult = speechResult[progress];
      if (interimResult.isFinal) {
        transcript += interimResult[0].transcript;
        this.value = transcript;
        progress += 1;
        return;
      }
      this.value = transcript + interimResult[0].transcript;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      console.error('SpeechRecognition API error:', event.error);
      this.onSpeechRecognitionError();
    };
    this.recognition.start();
  };

  private stopRecognition = (): void => {
    if (this.recognition) {
      this.recognition.stop();
      this.speechEvent.emit();
    }
  };

  /** The buttons inside the field: the default `md` fits a 48px field, `sm` the smaller ones. */
  private buttonSize(): 'sm' | undefined {
    return this.size === 'sm' || this.size === 'md' ? 'sm' : undefined;
  }

  /**
   * The type of the native input: a colour field is a text field, where the code is typed (the
   * picker is the colour input under the swatch); a password shown is a text field too.
   */
  private nativeType(): string | undefined {
    if (this.isColor()) return 'text';
    return this.type === 'password' && this.isPasswordVisible ? 'text' : this.type;
  }

  /** The mark at the start of the field: the swatch of a colour field, else the icon or spinner. */
  private hasLeadingMark(): boolean {
    return this.isColor() || Boolean(this.icon ?? this.await);
  }

  /**
   * The picker button of a colour field, shown while the user can change the value: a read-only
   * or disabled field offers no way to change it, as the swatch shows the colour, and leaves the
   * end of the field to the badge of its state (vittorio 2026-11-11: the button clashed with it).
   */
  private hasColorPicker(): boolean {
    return this.isColor() && this.canEdit();
  }

  /**
   * The dictation button, shown while the user can change the value: a read-only or disabled field
   * offers no way to change it, and leaves its end to the badge of its state, as a colour field
   * does with its picker button (vittorio 2026-11-11).
   */
  private hasMicButton(): boolean {
    return Boolean(this.mic) && !this.isColor() && this.canEdit();
  }

  /** The mark at the end of the field: the microphone, or the picker button of a colour field. */
  private hasTrailingMark(): boolean {
    return this.isColor() ? this.hasColorPicker() || this.await : this.hasMicButton();
  }

  /**
   * The name of the picker button of a colour field: what it does, and for which field, since a
   * form can hold more than one colour field and each has a button of its own.
   */
  private colorPickerName(): string {
    return this.accessibleName
      ? this.t.get('colorPickerFor', { name: this.accessibleName })
      : this.t.get('colorPicker');
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.type === 'number' && this.controlsLayout === 'horizontal' && (
          <mds-button
            class="counter-button counter-button--horizontal counter-button--decrease"
            icon={this.controlsIcon === 'arrow' ? miBaselineArrowDown : miBaselineRemove}
            disabled={!this.canEdit()}
            onClick={this.stepDown}
            tabindex="0"
            title={this.t.get('decrease')}
            variant="dark"
            tone="text"
            part="counter-button-decrease"
          ></mds-button>
        )}
        {/* The swatch of a colour field, where the icon goes: the colour of the value. A click
            opens the picker, a shortcut for the pointer; the picker button at the end is the
            control, in the order of the keyboard and with its name, so the swatch is hidden from
            assistive technologies instead of being a second button that does the same. */}
        {this.isColor() && (
          <div
            aria-hidden="true"
            class={clsx('swatch', !this.canEdit() && 'swatch--still')}
            onClick={this.openColorPicker}
            style={{ backgroundColor: this.value || undefined }}
          ></div>
        )}
        {this.type === 'textarea' ? (
          <textarea
            aria-label={this.accessibleName}
            class={clsx(
              'input',
              this.hasLeadingMark() && 'has-icon',
              this.hasTrailingMark() && 'has-right-icon',
            )}
            autoFocus={this.autofocus}
            disabled={this.isDisabled()}
            maxLength={this.maxlength}
            minLength={this.minlength}
            name={this.name}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onInput={this.onInput}
            onKeyDown={this.onKeyDown}
            part="field"
            placeholder={this.placeholder}
            readOnly={this.readonly}
            ref={(input) => (this.nativeInput = input)}
            required={this.required}
            tabIndex={this.tabindex}
            value={this.value}
          ></textarea>
        ) : (
          <input
            aria-label={this.accessibleName}
            class={clsx(
              'input',
              this.hasLeadingMark() && 'has-icon',
              this.hasTrailingMark() && 'has-right-icon',
              this.hasColorPicker() && this.await && 'has-right-icons',
            )}
            autoComplete={this.autocomplete}
            autoFocus={this.autofocus}
            disabled={this.isDisabled()}
            max={this.max}
            maxLength={this.maxlength}
            min={this.min}
            minLength={this.minlength}
            name={this.name}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onInput={this.onInput}
            onKeyDown={this.onKeyDown}
            pattern={this.pattern}
            list={this.datalistId}
            part="field"
            placeholder={this.placeholder}
            readOnly={this.readonly}
            ref={(input) => (this.nativeInput = input)}
            required={this.required}
            spellcheck={this.isColor() ? false : undefined}
            step={this.step}
            tabIndex={this.tabindex}
            type={this.nativeType()}
            value={this.isColor() ? this.colorText : this.value}
          />
        )}
        {this.type === 'number' && this.controlsLayout === 'vertical' && (
          <div class="counter counter--vertical">
            <mds-button
              class="counter-button"
              icon={this.controlsIcon === 'arrow' ? miBaselineArrowUp : miBaselineAdd}
              disabled={!this.canEdit()}
              onClick={this.stepUp}
              tabindex="0"
              title={this.t.get('increase')}
              variant="dark"
              size="sm"
              tone="text"
              part="counter-button-increase"
            ></mds-button>
            <mds-button
              class="counter-button"
              icon={this.controlsIcon === 'arrow' ? miBaselineArrowDown : miBaselineRemove}
              disabled={!this.canEdit()}
              onClick={this.stepDown}
              tabindex="0"
              title={this.t.get('decrease')}
              variant="dark"
              size="sm"
              tone="text"
              part="counter-button-decrease"
            ></mds-button>
          </div>
        )}
        {this.type === 'number' && this.controlsLayout === 'horizontal' && (
          <mds-button
            class="counter-button counter-button--horizontal counter-button--increase"
            variant="dark"
            tone="text"
            icon={this.controlsIcon === 'arrow' ? miBaselineArrowUp : miBaselineAdd}
            disabled={!this.canEdit()}
            onClick={this.stepUp}
            tabindex="0"
            title={this.t.get('increase')}
            part="counter-button-increase"
          ></mds-button>
        )}
        {this.type === 'password' && (
          <mds-button
            class="password-toggle-button"
            size={this.buttonSize()}
            variant="dark"
            tone="text"
            icon={this.isPasswordVisible ? miBaselineVisibleOff : miBaselineVisible}
            disabled={this.isDisabled()}
            onClick={this.handlePasswordToggleClick}
            tabindex="0"
            title={this.isPasswordVisible ? this.t.get('hidePassword') : this.t.get('showPassword')}
            part="password-toggle-button"
          ></mds-button>
        )}
        {this.type === 'password' && !this.isPasswordVisible && this.value?.length > 0 && (
          <div class={clsx('password-mask', (this.icon ?? this.await) && 'has-icon')}>
            <div class="password-mask-items" part="password-mask-items">
              {Array.from({ length: this.value.length }).map((_, index) => (
                <div key={index} class="password-mask-item" part="password-mask-item"></div>
              ))}
            </div>
          </div>
        )}
        {/* The picker button of a colour field, where the microphone goes, with the picker of the
            platform hidden under it, so that the popup of the browser opens next to it; only on a
            field the user can change (hasColorPicker). */}
        {this.hasColorPicker() && (
          <input
            aria-hidden="true"
            class="color-picker"
            onInput={this.onColorPick}
            ref={(input) => (this.colorPicker = input)}
            tabIndex={-1}
            type="color"
          />
        )}
        {this.hasColorPicker() && (
          <mds-button
            class="color-picker-button"
            size={this.buttonSize()}
            icon={miOutlinePalette}
            onClick={this.openColorPicker}
            tabindex="0"
            title={this.colorPickerName()}
            variant="dark"
            tone="text"
            part="color-picker-button"
          ></mds-button>
        )}
        {this.hasMicButton() && (
          <mds-button
            class={clsx('mic-toggle-button', this.isRecording && 'mic-toggle-button--recording')}
            size={this.buttonSize()}
            icon={this.speechToTextIcon}
            onClick={this.toggleTextRecognition}
            tabindex="0"
            title={this.t.get(this.speechToTextLabelKey)}
            variant="dark"
            tone="text"
            part="mic-toggle-button"
          ></mds-button>
        )}
        <mds-input-tip position="top" active={this.hasFocus} part="tip-top">
          {this.isDisabled() && (
            <mds-input-tip-item expanded variant="disabled"></mds-input-tip-item>
          )}
          {this.readonly && <mds-input-tip-item expanded variant="readonly"></mds-input-tip-item>}
          {this.required && (
            <mds-input-tip-item
              expanded={this.hasFocus}
              variant={this.isValid ? 'required-success' : 'required'}
            ></mds-input-tip-item>
          )}
        </mds-input-tip>
        <mds-input-tip position="bottom" active={this.hasFocus} part="tip-bottom">
          {this.tip && (
            <mds-input-tip-item expanded variant="text">
              {this.tip}
            </mds-input-tip-item>
          )}
          {this.maxlength && (
            <mds-input-tip-item part="tip-count" expanded variant={this.countVariant}>
              {this.currentLengthLabel}
            </mds-input-tip-item>
          )}
        </mds-input-tip>
        {this.datalist && (
          <datalist id={this.datalistId} class="datalist">
            {this.datalist.map((element, i) => {
              return <option key={i} value={element} />;
            })}
          </datalist>
        )}
        {this.icon && !this.await && !this.isColor() && (
          <mds-icon class={clsx('icon', this.variant)} name={this.icon} />
        )}
        <mds-spinner
          running={this.await}
          class={clsx(
            'await',
            this.variant,
            this.isColor() && !this.hasColorPicker() && 'await--end',
          )}
        />
      </Host>
    );
  }
}
