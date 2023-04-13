import { Component, Host, h, Prop, Event, EventEmitter, State } from '@stencil/core'
import clsx from 'clsx'
import { InputSwitchType, InputSwitchSizeType } from './meta/types'
import { inputSwitchIconVariant } from './meta/variants'
import { InputValueType } from '@type/input-value-type'
import { TypographyInfoType, TypographyReadType, TypographyVariants } from '@type/typography'

@Component({
  tag: 'mds-input-switch',
  styleUrl: 'mds-input-switch.css',
  shadow: true,
})
export class MdsInputSwitch {

  @State() dirty = false
  /**
   * Sets or returns whether a checkbox should automatically
   * get focus when the page loads
   */
  @Prop() readonly autofocus: boolean

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
  @Prop() readonly icon: string = ''

  /**
   * Sets or returns the indeterminate state of the checkbox
   */
  @Prop() readonly indeterminate: boolean = false

  /**
   * Specifies the name of an <input> element
   */
  @Prop() readonly name: string = ''

  /**
   * Specifies the size for the switch toggle, it works only if attribute 'type' is set to 'switch'
   */
  @Prop({ reflect: true }) readonly size: InputSwitchSizeType = 'md'

  /**
   * Specifies switch type: switch (default), checkbox and radio
   */
  @Prop() readonly type: InputSwitchType = 'switch'

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography?: TypographyInfoType | TypographyReadType = 'detail'

  /**
   * Specifies the variant for `typography`
   */
  @Prop() readonly variant?: TypographyVariants

  /**
   * Specifies the value of the input element
   */
  @Prop() value?: InputValueType = ''

  /**
   * Emits when the value changes
   */
  @Event({ eventName: 'mdsInputSwitchChange' }) changeEvent: EventEmitter<{ name: string, value: InputValueType }>

  private handleInputOnChange = (e: Event): void => {
    const { value } = (e.target as HTMLInputElement)
    e.preventDefault()
    e.stopPropagation()
    this.changeEvent.emit({ name: this.name, value })
  }

  private handleDirty = (): void => {
    this.dirty = true
  }

  render () {

    const { iconChecked, iconUnchecked, iconIndeterminate } = inputSwitchIconVariant[this.type]
    const iconCheckedUser = this.icon !== '' ? this.icon : iconChecked
    return (
      <Host
        class={clsx(
          this.disabled && 'disabled',
          this.indeterminate && 'indeterminate',
          this.type === 'switch' ? 'items-stretch' : 'items-start',
        )}
        onClick={this.handleDirty}
      >
        <input
          autoFocus={this.autofocus}
          checked={this.checked}
          class="field"
          disabled={this.disabled}
          id="field"
          indeterminate={this.indeterminate}
          name={this.name}
          onChange={event => this.handleInputOnChange(event)}
          type={this.type === 'switch' ? 'checkbox' : this.type }
          value={this.value ?? undefined}
        />
        { this.type === 'switch'
          ?
          <label htmlFor="field" class={clsx(this.dirty !== false && 'dirty', 'switch-container')}>
            <div class="switch">
              <div class="switch-toggle"/>
            </div>
          </label>
          :
          <label htmlFor="field" class="label-icon">
            <mds-text class="icon-typography-unchecked" tag="div" typography={this.typography} variant={this.variant}>
              <mds-icon class="icon-unchecked" name={iconUnchecked}/>
            </mds-text>
            <mds-text class="icon-typography-checked" tag="div" typography={this.typography} variant={this.variant}>
              <mds-icon class="icon-checked" name={clsx(this.indeterminate ? iconIndeterminate : iconCheckedUser)}/>
            </mds-text>
          </label>
        }
        <label htmlFor="field" class="label-text">
          <mds-text typography={this.typography} variant={this.variant}>
            <slot></slot>
          </mds-text>
        </label>
      </Host>
    )
  }
}
