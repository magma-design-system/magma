import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import clsx from 'clsx'
import globalStyles from './global.css?inline'

type InputValueType =
  | null
  | number
  | string
  | undefined

type InputTextType =
  | 'date'
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'textarea'
  | 'time'
  | 'url'

type AutocompleteType =
  | 'additional-name'
  | 'address'
  | 'address-level1'
  | 'address-level2'
  | 'address-level3'
  | 'address-level4'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'bday'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'cc-additional-name'
  | 'cc-csc'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-family-name'
  | 'cc-given-name'
  | 'cc-name'
  | 'cc-number'
  | 'cc-type'
  | 'country'
  | 'country-name'
  | 'current-password'
  | 'email'
  | 'family-name'
  | 'given-name'
  | 'honorific-prefix'
  | 'honorific-suffix'
  | 'impp'
  | 'language'
  | 'name'
  | 'new-password'
  | 'nickname'
  | 'off'
  | 'on'
  | 'one-time-code'
  | 'organization'
  | 'organization-title'
  | 'photo'
  | 'postal-code'
  | 'sex'
  | 'street-address'
  | 'tel'
  | 'tel-area-code'
  | 'tel-country-code'
  | 'tel-extension'
  | 'tel-local'
  | 'tel-national'
  | 'transaction-amount'
  | 'transaction-currency'
  | 'url'
  | 'username'

type ThemeStatusVariantType =
  | 'error'
  | 'info'
  | 'success'
  | 'warning'

@customElement('mds-input')
export class MdsInput extends LitElement {

  static formAssociated = true

  static styles = [
    unsafeCSS(globalStyles),
  ]

  private internals = this.attachInternals()

  private _value?: InputValueType

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @property() readonly autocomplete?: AutocompleteType = 'off'

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @property() readonly autofocus: boolean = false

  /**
   * A list of search terms to be searched from the input field,
   * it should be used with type="search" input.
   */
  @property({ type: Array, hasChanged: (value, oldValue) => {
    console.log('OldValue', oldValue)
    console.log('Actual value', value)
    return true
  } }) readonly datalist?: string | string[]

  /**
   * If true, the element is displayed as disabled
   */
  @property() readonly disabled?: boolean = false

  /**
   * An icon displayed at the right of the input
   */
  @property() readonly icon?: string

  /**
   * Specifies the maximum value
   * use it with input type="number" or type="date"
   * Example: max="180", max="2046-12-04"
   */
  @property() readonly max?: number

  /**
   * Specifies the maximum number of characters allowed in an element
   * use it with input type="number"
   */
  @property() readonly maxlength?: number = undefined

  /**
   * Specifies the minimum value
   * use it with input type="number" or type="date"
   * Example: min="-3", min="1988-04-15"
   */
  @property() readonly min?: number

  /**
   * Specifies the minimum number of characters allowed in an element
   * use it with input type="number"
   */
  @property() readonly minlength?: number

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @property() readonly name?: string

  /**
   * Specifies a regular expression that element\'s value is checked against
   */
  @property() readonly pattern?: string

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @property() readonly placeholder?: string

  /**
   * Specifies that the element is read-only
   */
  @property() readonly readonly?: boolean = false

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @property() readonly required?: boolean = false

  /**
   * Sets the variant of the input field
   */
  @property({ reflect: true }) readonly variant?: ThemeStatusVariantType

  /**
   * Sets the word(s) of the variant of the input field
   */
  @property() readonly variantTip?: string

  /**
   * Specifies the interval between legal numbers in an input field
   */
  @property() readonly step?: string

  /**
   * Specifies the type of input element
   */
  @property() readonly type: InputTextType = 'text'

  // Using custom setter / getter because I need to fire the change-event when the property actually change
  /**
   * Specifies the value of the input element
   */
  @property({ reflect: true })
  get value () { return this._value }

  set value (val: InputValueType) {
    const oldValue = this._value
    this._value = val
    this.dispatchEvent(new CustomEvent('change-event', { bubbles: true, detail: { message: this._value } }))
    this.requestUpdate('value', oldValue)
  }

  @state() private tabindex?: number

  @query('.input') private nativeInput?: HTMLInputElement | HTMLTextAreaElement

  connectedCallback (): void {
    super.connectedCallback()
    const host = this.shadowRoot?.host as HTMLElement
    const tabindex = host.getAttribute('tabindex')
    if (host.hasAttribute('tabindex') && tabindex !== null && tabindex !== undefined) {
      this.tabindex = parseInt(tabindex)
      host.removeAttribute('tabindex')
    }
    console.log('globalStyles', globalStyles)
  }

  private getValue (): string {
    return typeof this.value === 'number' ? this.value.toString() : (this.value || '').toString()
  }

  private onInput = (ev: InputEvent) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement | false
    if (input) {
      this.value = input.value || ''
    }
    const event = new CustomEvent('input-change-event', { bubbles: true, detail: { message: ev } })
    this.dispatchEvent(event)
  }

  private onBlur = () => {
    // this.hasFocus = false
    this.dispatchEvent(new CustomEvent('blur-event', { bubbles: true }))
  }

  private onFocus = (ev: Event) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement
    // this.hasFocus = true
    this.dispatchEvent(new CustomEvent('focus-event', { bubbles: true }))
    if (this.readonly) {
      // setTimeout to avoid Safari 14.1.2
      // to unselect text when mouse is clicked slowly
      setTimeout(() => {
        input.select()
      }, 10)
    }
  }

  /* TODO
    - maxLength is always set to 0 even when null
    - .list is not accepted in strict mode
    - datalist cannot be tested as doesn't parse array input (???)
  */
  private buildInput (value: string) {
    let input
    if (this.type === 'textarea') {
      input = html`
        <textarea
          class="${clsx('input', this.icon && 'has-icon')}"
          .value="${value}"
          .maxLength="${this.maxlength}"
          .minLength="${this.minlength}"
          .name="${this.name}"
          .placeholder="${this.placeholder || ''}"
          .tabIndex="${this.tabindex}"
          ?autoFocus="${this.autofocus}"
          ?disabled="${this.disabled}"
          ?readOnly="${this.readonly}"
          ?required="${this.required}"
          @blur="${this.onBlur}"
          @focus="${this.onFocus}"
          @input="${this.onInput}">
        </textarea>
      `
    } else {
      /* TODO reintegrare:
        - .list="${this.datalist ? 'datalist' : ''}", al momento è sempre impostato list
        - .maxLength="${this.maxlength}"
      */
      input = html`
        <input
          class="${clsx('input', this.icon && 'has-icon')}"
          list="${this.datalist ? 'datalist' : ''}"
          .autoComplete="${this.autocomplete}"
          .max="${this.max}"
          .min="${this.min}"
          .minLength="${this.minlength}"
          .name="${this.name}"
          .type="${this.type}"
          .pattern="${this.pattern}"
          .placeholder=${this.placeholder || ''}
          .step="${this.step}"
          .tabIndex="${this.tabindex}"
          .value="${value}"
          ?autoFocus="${this.autofocus}"
          ?disabled="${this.disabled}"
          ?readOnly="${this.readonly}"
          ?required="${this.required}"
          @blur="${this.onBlur}"
          @focus="${this.onFocus}"
          @input="${this.onInput}"
        />
      `
    }

    return input
  }

  private buildDatalist () {
    if (!this.datalist || (this.datalist.length && this.datalist.length === 0)) return html``

    const datalist = Array.isArray(this.datalist) ? this.datalist : JSON.parse(this.datalist)

    return html`
      <datalist id="datalist" class="datalist">
        ${datalist.map((element: string) => html`<option value="${element}" />`)}
      </datalist>
    `
  }

  render () {
    const value = this.getValue()
    const input = this.buildInput(value)
    const datalist = this.buildDatalist()

    return html`
      ${input}
      ${this.required ? html`
        <mds-text typography="option" class="tip top-1 required">Obbligatorio</mds-text>
      ` : ''}
      ${this.disabled ? html`
        <mds-text typography="option" class="tip top-1 disabled">Disabilitato</mds-text>
      ` : ''}
      ${this.readonly ? html`
        <mds-text typography="option" class="tip top-1 read-only">Sola lettura</mds-text>
      ` : ''}
      ${this.variant && this.variantTip ? html`
        <mds-text typography="option" class="tip-variant bottom-1">${this.variantTip}</mds-text>
      ` : ''}
      ${datalist}
      ${this.icon ? html`
        <mds-icon class="${clsx('icon', this.variant)}" name="${this.icon}"/>
      ` : ''}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mds-input': MdsInput
  }
}
