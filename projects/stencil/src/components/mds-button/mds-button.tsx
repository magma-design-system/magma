import clsx from 'clsx'
import { ButtonIconPositionType, ButtonSizeType, ButtonTargetType, ButtonType, ButtonVariantType } from '@type/button'
import { Component, Host, Element, h, Prop, Watch, AttachInternals } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { ToneVariantType } from '@type/variant'
import { TypographyType } from '@type/typography'
import { buttonSizeTypographyVariant } from './meta/variants'
import { setAttributeIfEmpty, unslugName } from '@common/aria'
import { isIconFormatIsBase64, isIconFormatIsSVG } from '@common/icon'
import { TypographyTruncateType } from '@type/text'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 * @slot notification - Add `HTML elements` or `components`, it is **recommended** to use `mds-notification` element.
 * @part icon - The icon inside the component
 */

@Component({
  tag: 'mds-button',
  styleUrl: 'mds-button.css',
  shadow: true,
  formAssociated: true,
})
export class MdsButton {

  private typography?: TypographyType
  private hasText?: boolean
  private hasNotification?: boolean
  private km = new KeyboardManager()

  @Element() host: HTMLMdsButtonElement

  @AttachInternals() internals: ElementInternals

  /**
   * Specifies if the component is focused when is loaded on the viewport
   */
  @Prop() readonly autoFocus: boolean

  /**
   * The icon displayed in the button
   */
  @Prop() readonly icon?: string

  /**
   * Specifies the horizontal position of the icon displayed in the button
   */
  @Prop() readonly iconPosition?: ButtonIconPositionType = 'left'

  /**
   * The type of the button element
   */
  @Prop() readonly type?: ButtonType = 'submit'

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonVariantType = 'primary'

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'strong'

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
  @Prop({ mutable: false, reflect: true }) disabled?: boolean

  /**
   * Specifies if the button is awaiting for a response
   */
  @Prop({ reflect: true }) readonly await: boolean

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

  @Watch('disabled')
  disabledChanged (newValue: boolean): void {
    if (newValue) {
      this.km.attachClickBehavior()
      return
    }
    this.km.detachClickBehavior()

    /**
     * When the component is disabled="false" it won't work with onClick events
     * since formAssociated where added to it.
     * https://github.com/ionic-team/stencil/issues/5461
     */
    this.disabled = undefined
  }

  @Watch('await')
  awaitChanged (newValue: boolean): void {
    this.host.setAttribute('aria-busy', newValue.toString())
    if (newValue) {
      this.km.attachClickBehavior()
      return
    }
    this.km.detachClickBehavior()
  }

  @Watch('type')
  handleTypeChange (newValue: string): void {
    // If not participating we don't do anything
    if (!this.internals.form) return

    if (newValue === 'submit') {
      this.host.removeEventListener('click', this.handleReset)
      this.host.addEventListener('click', this.handleRequestSubmitForm)
    } else if (newValue === 'reset') {
      this.host.removeEventListener('click', this.handleRequestSubmitForm)
      this.host.addEventListener('click', this.handleReset)
    } else {
      this.host.removeEventListener('click', this.handleRequestSubmitForm)
      this.host.removeEventListener('click', this.handleReset)
    }
  }

  private handleRequestSubmitForm = (e: MouseEvent) => {
    e.preventDefault()
    this.internals.form?.requestSubmit()
  }

  private handleReset = (e: MouseEvent) => {
    e.preventDefault()
    this.internals.form?.reset()
  }

  private mouseDown = () => {
    this.active = true
  }

  private mouseUp = () => {
    this.active = false
  }

  private redirectBlank = () => {
    const a = document.createElement('a')
    a.target = '_blank'
    a.href = this.href ?? ''
    a.click()
  }

  componentWillLoad ():void {
    this.hasNotification = this.host.querySelector('[slot="notification"]') !== null
    this.hasText = this.host.innerHTML !== ''

    if (this.href) {
      this.host.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault()
        if (this.target === 'blank') {
          this.redirectBlank()
          return
        }
        if (typeof window !== 'undefined') {
          window.location.href = this.href ?? '' // TypeScript 5.0.2 bug: if (this.href) not checked
        }
      })
    } else if (this.internals.form) {
      if (this.type === 'submit') {
        this.host.addEventListener('click', this.handleRequestSubmitForm)
      } else if (this.type === 'reset') {
        this.host.addEventListener('click', this.handleReset)
      }
    }
  }

  componentDidLoad ():void {
    this.km.addElement(this.host)
    if (!this.await) {
      this.km.attachClickBehavior()
    }
    this.host.setAttribute('aria-busy', this.await ? 'true' : 'false')

    if (this.autoFocus) {
      this.host.focus()
    }

    if (isIconFormatIsBase64(this.icon)) {
      return
    }
    if (isIconFormatIsSVG(this.icon)) {
      return
    }

    if (!this.hasText && this.icon) {
      const iconTitle = unslugName(this.icon)
      if (!this.host.hasAttribute('aria-label')) {
        setAttributeIfEmpty(this.host, 'title', iconTitle)
      }
      if (!this.host.hasAttribute('title')) {
        setAttributeIfEmpty(this.host, 'aria-label', iconTitle)
      }
    }

    setAttributeIfEmpty(this.host, 'role', 'button')
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  render () {
    this.typography = buttonSizeTypographyVariant[this.size] as TypographyType

    return (
      <Host class={clsx(!this.hasText && 'no-text')} onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} onMouseOut={this.mouseUp} tabindex="0">
        <div class="await">
          <mds-spinner class="spinner" running={this.await}/>
        </div>
        { this.icon && this.iconPosition === 'left' && <mds-icon aria-hidden="true" class="icon" name={this.icon} part="icon"/> }
        { this.hasText && <mds-text class="text" part="label" typography={this.typography} truncate={this.truncate}><slot /></mds-text> }
        { this.hasNotification && <slot name="notification"/> }
        { this.icon && this.iconPosition === 'right' && <mds-icon aria-hidden="true" class="icon" name={this.icon} part="icon"/> }
      </Host>
    )
  }
}
