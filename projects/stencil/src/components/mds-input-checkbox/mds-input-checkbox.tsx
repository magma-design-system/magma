import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyType } from '../../types/typography'

@Component({
  tag: 'mds-input-checkbox',
  styleUrl: 'mds-input-checkbox.css',
  shadow: true,
})
export class MdsInputCheckbox {

  /**
   * Specifies that an <input> element should be pre-selected
   * when the page loads (for type="checkbox" or type="radio")
   */
  @Prop() readonly checked?: boolean

  /**
   * The checked icon displayed
   */
  @Prop() readonly icon?: string = 'form-checkbox-checked'

  /**
   * Specifies the name of an <input> element
   */
  @Prop() readonly name?: string

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography?: TypographyType = 'detail'

  /**
   * Specifies the value of the input element
   */
  @Prop() value?: string | number | null = ''

  render () {
    return (
      <Host>
        <input
          checked={this.checked}
          class="field"
          id="field"
          name={this.name}
          type="checkbox"
          value={this.value}
        />
        <label htmlFor="field" class="label-icon">
          <mds-text class="icons" tag="div" typography={this.typography}>
            <mds-icon class="icon-unchecked" name="form-checkbox-unchecked"/>
            <mds-icon class="icon-checked" name={this.icon}/>
          </mds-text>
        </label>
        <label htmlFor="field" class="label-text">
          <mds-text typography={this.typography}>
            <slot></slot>
          </mds-text>
        </label>
      </Host>
    )
  }
}
