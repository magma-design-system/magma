import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';

import { AutocompleteTypes, TextFieldTypes } from './interface';
export interface InputChangeEventDetail {
  value: string | number | undefined | null;
}

@Component({
  tag: 'mds-input',
  styleUrl: 'mds-input.css',
  shadow: true,
})

export class MdsInput {

  private nativeInput?: HTMLInputElement;
  private tabindex?: string | number;

  @Element() el!: HTMLElement;

  @State() hasFocus = false;

  // https://www.w3schools.com/tags/tag_input.asp
  @Prop() autocomplete: AutocompleteTypes = 'off';
  @Prop() autofocus?: boolean = false;
  @Prop() disabled?: boolean = false;
  @Prop() max?: string;
  @Prop() maxlength?: number;
  @Prop() min?: string;
  @Prop() minlength?: number;
  @Prop() name?: string;
  @Prop() pattern?: string;
  @Prop() placeholder?: string;
  @Prop() readonly?: boolean = false;
  @Prop() required?: boolean = false;
  @Prop() spellcheck?: boolean = false;
  @Prop() step?: string;
  @Prop() type: TextFieldTypes = 'text';
  @Prop({ mutable: true }) value?: string | number | null = '';

  @Event() changeEvent!: EventEmitter<InputChangeEventDetail>;
  @Event() keyDownEvent!: EventEmitter<KeyboardEvent>;
  @Event() blurEvent!: EventEmitter<void>;
  @Event() focusEvent!: EventEmitter<void>;

  componentWillLoad() {
    // If the mds-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // mds-input to avoid causing tabbing twice on the same element
    if (this.el.hasAttribute('tabindex')) {
      const tabindex = this.el.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? tabindex : undefined;
      this.el.removeAttribute('tabindex');
    }
  }

  @Watch('value')
  protected valueChanged() {
    this.changeEvent.emit({ value: this.value == null ? this.value : this.value.toString() });
  }

  /**
   * Sets focus on the specified `my-input`.
   * Use this method instead
   * of the global `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.nativeInput) {
      this.nativeInput.focus();
    }
  }

  /**
   * Returns the native `<input>` element used under the hood.
   */
  @Method()
  getInputElement(): Promise<HTMLInputElement> {
    return Promise.resolve(this.nativeInput!);
  }

  private getValue(): string {
    return typeof this.value === 'number' ? this.value.toString() : (this.value || '').toString();
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLInputElement | null;
    if (input) {
      this.value = input.value || '';
    }
    this.keyDownEvent.emit(ev as KeyboardEvent);
  };

  private hasValue(): boolean {
    return this.getValue().length > 0;
  }

  private onBlur = () => {
    this.hasFocus = false;
    this.blurEvent.emit();
  };

  private onFocus = () => {
    this.hasFocus = true;
    this.focusEvent.emit();
  }

  render() {
    const value = this.getValue();

    return (
      <Host aria-disabled={this.disabled ? 'true' : null}
        class={{
          'has-value': this.hasValue(),
          'has-focus': this.hasFocus,
        }}>
        <input
          ref={(input) => (this.nativeInput = input)}
          disabled={this.disabled}
          autoComplete={this.autocomplete}
          autoFocus={this.autofocus}
          min={this.min}
          max={this.max}
          minLength={this.minlength}
          maxLength={this.maxlength}
          name={this.name}
          pattern={this.pattern}
          placeholder={this.placeholder || ''}
          readOnly={this.readonly}
          required={this.required}
          spellcheck={this.spellcheck ? 'true' : undefined}
          step={this.step}
          tabindex={this.tabindex}
          type={this.type}
          value={value}
          onInput={this.onInput}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
        />
      </Host>
    );
  }
}
