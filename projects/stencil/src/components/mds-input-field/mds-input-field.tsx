import { Component, Element, Host, Prop, h } from '@stencil/core'
import { MdsValidationErrors } from '@component/mds-input/meta/validators'
import { ThemeStatusVariantType } from '@type/variant'

@Component({
  tag: 'mds-input-field',
  styleUrl: 'mds-input-field.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputField {

  private slotInput: HTMLSlotElement

  @Element() host!: HTMLMdsInputFieldElement

  private handleValidation (mdsInput: HTMLMdsInputElement) {
    // mdsInput.hasValidator().then(hasValidator => {
    // if (!hasValidator) return
    mdsInput.getErrors().then((errors: MdsValidationErrors) => {
      if (errors) {
        this.variant = 'error'
        const messages = Object.entries(errors).map(v => v[1]).filter(v => v)
        this.message = messages.length ? messages.join(';') : undefined
        return
      }
      this.variant = 'success'
      this.message = undefined
    })
    // })
  }

  componentDidLoad (): void {
    const [mdsInput] = this.slotInput.assignedElements() as HTMLMdsInputElement[]
    if (!mdsInput) throw new Error('Mds input not found')
    mdsInput.addEventListener('mdsInputValidation', () => this.handleValidation(mdsInput))
  }

  /**
   * Display a text on the top of the input text field
   */
  @Prop({ mutable: true }) label?: string

  /**
   * Display a message at the bottom of the input text field
   */
  @Prop({ mutable: true }) message?: string

  /**
   * Display the variant of a message at the bottom of the input text field
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeStatusVariantType

  render () {
    return (
      <Host>
        <mds-text class="label" typography="label">{ this.label }</mds-text>
        <div class="message-window">
          <div>
            <slot ref={i => this.slotInput = i as HTMLSlotElement }></slot>
          </div>
          <div class="message" >{ this.message?.split(';').map((m, i) => <mds-text typography="caption" key={i}>{m}</mds-text>) }</div>
        </div>
      </Host>
    )
  }
}
