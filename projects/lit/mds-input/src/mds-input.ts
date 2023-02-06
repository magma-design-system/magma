import { LitElement, html, unsafeCSS, nothing } from 'lit'
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

  private internals

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @property({ type: String }) readonly autocomplete?: AutocompleteType = 'off'

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @property({ type: Boolean }) readonly autofocus: boolean = false

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
  @property({ type: Boolean }) readonly disabled?: boolean = false

  /**
   * An icon displayed at the right of the input
   */
  @property({ type: String }) readonly icon?: string

  /**
   * Specifies the maximum value
   * use it with input type="number" or type="date"
   * Example: max="180", max="2046-12-04"
   */
  @property({ type: Number }) readonly max?: number

  /**
   * Specifies the maximum number of characters allowed in an element
   * use it with input type="number"
   */
  @property({ type: Number }) readonly maxlength?: number = undefined

  /**
   * Specifies the minimum value
   * use it with input type="number" or type="date"
   * Example: min="-3", min="1988-04-15"
   */
  @property({ type: Number }) readonly min?: number

  /**
   * Specifies the minimum number of characters allowed in an element
   * use it with input type="number"
   */
  @property({ type: Number }) readonly minlength?: number

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @property({ type: String }) readonly name?: string

  /**
   * Specifies a regular expression that element\'s value is checked against
   */
  @property({ type: String }) readonly pattern?: string

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @property({ type: String }) readonly placeholder?: string

  /**
   * Specifies that the element is read-only
   */
  @property({ type: Boolean }) readonly readonly?: boolean = false

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @property({ type: Boolean }) readonly required?: boolean = false

  /**
   * Sets the variant of the input field
   */
  @property({ reflect: true }) readonly variant?: ThemeStatusVariantType

  /**
   * Sets the word(s) of the variant of the input field
   */
  @property({ type: String }) readonly variantTip?: string

  /**
   * Specifies the interval between legal numbers in an input field
   */
  @property({ type: Number }) readonly step?: number

  /**
   * Specifies the type of input element
   */
  @property({ type: String }) readonly type: InputTextType = 'text'

  // Using custom setter / getter because I need to fire the change-event when the property actually change
  /**
   * Specifies the value of the input element
   */
  @property({ reflect: true, type: String }) value: InputValueType

  @state() private tabindex?: number

  @query('.input') inputElement: HTMLElement | HTMLTextAreaElement | undefined

  constructor () {
    super()
    this.internals = this.attachInternals()
  }

  updated () {
    this.manageRequired(null)
  }

  connectedCallback (): void {
    super.connectedCallback()
    const host = this.shadowRoot?.host as HTMLElement
    const tabindex = host.getAttribute('tabindex')
    if (host.hasAttribute('tabindex') && tabindex !== null && tabindex !== undefined) {
      this.tabindex = parseInt(tabindex)
      host.removeAttribute('tabindex')
    }
  }

  private getValue (): string {
    return typeof this.value === 'number' ? this.value.toString() : (this.value || '').toString()
  }

  private onInput = (ev: InputEvent) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement
    if (input) {
      this.value = input.value || ''
    }
    this.internals.setFormValue(this.value as string)
    this.manageRequired(this.value as string)
    this.dispatchEvent(new CustomEvent('changeEvent', { bubbles: true, detail: { value: this.value } }))
    const event = new CustomEvent('inputEvent', { bubbles: true, detail: { value: ev } })
    this.dispatchEvent(event)
  }

  private manageRequired (data: string | null) {
    if (!data && this.required) {
      this.internals.setValidity(
        {
          valueMissing: true,
        },
        'Il campo è obbligatorio',
        this.inputElement,
      )
    } else {
      this.internals.setValidity({})
    }
  }

  private onBlur = () => {
    // this.hasFocus = false
    this.dispatchEvent(new CustomEvent('blurEvent', { bubbles: true }))
  }

  private onFocus = (ev: Event) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement
    // this.hasFocus = true
    this.dispatchEvent(new CustomEvent('focusEvent', { bubbles: true }))
    if (this.readonly) {
      // setTimeout to avoid Safari 14.1.2
      // to unselect text when mouse is clicked slowly
      setTimeout(() => {
        input.select()
      }, 10)
    }
  }

  private buildInput (value: string) {
    let input
    if (this.type === 'textarea') {
      input = html`
        <textarea
          class=${clsx('input', this.icon && 'has-icon') ?? nothing}
          .value=${value ?? nothing}
          .maxLength=${this.maxlength ?? nothing}
          .minLength=${this.minlength ?? nothing}
          .name=${this.name ?? nothing}
          .placeholder=${this.placeholder ?? nothing}
          .tabIndex=${this.tabindex ?? nothing}
          ?autoFocus=${this.autofocus ?? nothing}
          ?disabled=${this.disabled ?? nothing}
          ?readOnly=${this.readonly ?? nothing}
          ?required=${this.required ?? nothing}
          @blur=${this.onBlur ?? nothing}
          @focus=${this.onFocus ?? nothing}
          @input=${this.onInput ?? nothing}>
        </textarea>
      `
    } else {
      input = html`
        <input
          class=${clsx('input', this.icon && 'has-icon')}
          list=${this.datalist ? 'datalist' : nothing}
          .autoComplete=${this.autocomplete ?? nothing}
          .max=${this.max ?? nothing}
          .maxLength=${this.maxlength ?? nothing}
          .min=${this.min ?? nothing}
          .minLength=${this.minlength ?? nothing}
          .name=${this.name ?? nothing}
          .type=${this.type ?? nothing}
          .pattern=${this.pattern ?? nothing}
          .placeholder=${this.placeholder ?? nothing}
          .step=${this.step ?? nothing}
          .tabIndex=${this.tabindex ?? nothing}
          .value=${value ?? nothing}
          ?autoFocus=${this.autofocus ?? nothing}
          ?disabled=${this.disabled ?? nothing}
          ?readOnly=${this.readonly ?? nothing}
          ?required=${this.required ?? nothing}
          @blur=${this.onBlur ?? nothing}
          @focus=${this.onFocus ?? nothing}
          @input=${this.onInput ?? nothing}
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
