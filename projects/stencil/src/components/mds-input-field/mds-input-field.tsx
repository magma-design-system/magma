import { Component, Element, Host, Prop, h } from '@stencil/core'
import { MdsValidationErrors } from './meta/validators'
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

  componentDidLoad (): void {
    const [mdsInput] = this.slotInput.assignedElements() as HTMLMdsInputElement[]
    if (!mdsInput) throw new Error('Mds input not found')
    mdsInput.addEventListener('blur', () => {
      mdsInput.getErrors().then((errors: MdsValidationErrors) => {
        if (errors) {
          this.variant = 'error'
          mdsInput.variant = this.variant
          this.message = Object.entries(errors).map(v => v[1]).join('\n')
          return
        }
        this.variant = 'success'
        mdsInput.variant = this.variant
        this.message = undefined
      })
    })
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
          <mds-text class="message" typography="caption">{ this.message }</mds-text>
        </div>
      </Host>
    )
  }
}
