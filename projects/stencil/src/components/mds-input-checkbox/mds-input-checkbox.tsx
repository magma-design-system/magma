import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyType } from '../../types/typography'
import clsx from 'clsx'

// https://www.w3schools.com/jsref/dom_obj_checkbox.asp

@Component({
  tag: 'mds-input-checkbox',
  styleUrl: 'mds-input-checkbox.css',
  shadow: true,
})
export class MdsInputCheckbox {

  /**
   * Sets or returns whether a checkbox should automatically
   * get focus when the page loads
   */
  @Prop() readonly autofocus?: boolean

  /**
   * Specifies that an <input> element should be pre-selected
   * when the page loads (for type="checkbox" or type="radio")
   */
  @Prop() readonly checked?: boolean

  /**
   * Sets or returns whether a checkbox is disabled, or not
   */
  @Prop() readonly disabled?: boolean

  /**
   * The checked icon displayed
   */
  @Prop() readonly icon?: string = 'form-checkbox-checked'

  /**
   * Sets or returns the indeterminate state of the checkbox
   */
  @Prop() readonly indeterminate?: boolean

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
      <Host
        class={clsx(
          this.disabled && 'disabled',
          this.indeterminate && 'indeterminate',
        )}
      >
        <input
          autoFocus={this.autofocus}
          checked={this.checked}
          class="field"
          disabled={this.disabled}
          id="field"
          indeterminate={this.indeterminate}
          name={this.name}
          type="checkbox"
          value={this.value}
        />
        <label htmlFor="field" class="label-icon">
          <mds-text class="icon-typography-unchecked" tag="div" typography={this.typography}>
            <mds-icon class="icon-unchecked" name="form-checkbox-unchecked"/>
          </mds-text>
          <mds-text class="icon-typography-checked" tag="div" typography={this.typography}>
            <mds-icon class="icon-checked" name={clsx(this.indeterminate ? 'form-checkbox-indeterminate' : this.icon)}/>
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
