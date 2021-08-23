import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core'
import clsx from 'clsx'
import { InputSwitchType } from '../../types/input-switch-type'
import { InputValueType } from '../../types/input-value-type'
import { TypographySecondaryType } from '../../types/typography'
import { inputSwitchIconVariant } from '../../variants/input-switch-icons'

@Component({
  tag: 'mds-input-switch',
  styleUrl: 'mds-input-switch.css',
  shadow: true,
})
export class MdsInputSwitch {

  /**
   * Sets or returns whether a checkbox should automatically
   * get focus when the page loads
   */
  @Prop() readonly autofocus?: boolean

  /**
   * Specifies that an <input> element should be pre-selected
   * when the page loads (for type="checkbox" or type="radio")
   */
  @Prop({ reflect: true }) readonly checked?: boolean

  /**
   * Sets or returns whether a checkbox is disabled, or not
   */
  @Prop() readonly disabled?: boolean

  /**
   * The checked icon displayed
   */
  @Prop() readonly icon?: string = null

  /**
   * Sets or returns the indeterminate state of the checkbox
   */
  @Prop() readonly indeterminate?: boolean

  /**
   * Specifies the name of an <input> element
   */
  @Prop() readonly name?: string

  /**
   * Specifies switch type: switch (default), checkbox and radio
   */
  @Prop() readonly type?: InputSwitchType = 'checkbox'

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography?: TypographySecondaryType = 'detail'

  /**
   * Specifies the value of the input element
   */
  @Prop() value?: InputValueType = ''

  /**
   * Emits when the value changes
   */
  @Event() valueChange: EventEmitter<{ name: string, value: InputValueType }>

  private handleInputOnChange (e: Event): void {
    const { value } = (e.target as HTMLInputElement)
    e.preventDefault()
    e.stopPropagation()
    this.valueChange.emit({ name: this.name, value })
  }

  render () {

    const { iconChecked, iconUnchecked, iconIndeterminate } = inputSwitchIconVariant[this.type]
    const iconCheckedUser = this.icon !== null ? this.icon : iconChecked

    return (
      <Host
        class={clsx(
          this.disabled && 'disabled',
          this.indeterminate && 'indeterminate',
          this.type === 'switch' ? 'items-stretch' : 'items-start',
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
          type={this.type === 'switch' ? 'checkbox' : this.type }
          value={this.value}
          onChange={event => this.handleInputOnChange(event)}
        />
        { this.type === 'switch'
          ?
          <label htmlFor="field" class="switch-container">
            <div class="switch">
              <div class="switch-toggle"></div>
            </div>
          </label>
          :
          <label htmlFor="field" class="label-icon">
            <mds-text class="icon-typography-unchecked" tag="div" typography={this.typography}>
              <mds-icon class="icon-unchecked" name={iconUnchecked}/>
            </mds-text>
            <mds-text class="icon-typography-checked" tag="div" typography={this.typography}>
              <mds-icon class="icon-checked" name={clsx(this.indeterminate ? iconIndeterminate : iconCheckedUser)}/>
            </mds-text>
          </label>
        }
        <label htmlFor="field" class="label-text">
          <mds-text typography={this.typography}>
            <slot></slot>
          </mds-text>
        </label>
      </Host>
    )
  }
}
