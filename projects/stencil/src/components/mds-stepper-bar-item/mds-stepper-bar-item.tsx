import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core'
import { TypographySecondaryType } from '../../types/typography'
import clsx from 'clsx'

@Component({
  tag: 'mds-stepper-bar-item',
  styleUrl: 'mds-stepper-bar-item.css',
  shadow: true,
})
export class MdsStepperBarItem {

  @Element() private element: HTMLMdsStepperBarItemElement

  @State() isChecked: boolean
  @State() isCurrent: boolean

  /**
   * Specifies a short description of the component
   */
  @Prop() readonly text!: string

  /**
   * Specifies the icon displayed of the component when is not checked or the current item
   */
  @Prop() readonly icon!: string

  /**
   * Specifies the icon displayed of the component when is checked
   */
  @Prop() iconChecked? = this.icon

  /**
   * Specifies if the component is checked or not
   */
  @Prop({ reflect: true }) readonly checked?: boolean

  /**
   * Specifies if the component is the current or not
   */
  @Prop({ mutable: true, reflect: true }) current?: boolean

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographySecondaryType = 'caption'

  componentWillLoad (): void {
    this.isCurrent = this.current
    this.isChecked = this.checked
  }

  @Watch('checked')
  checkChecked (newValue: boolean): void {
    this.isChecked = newValue
  }

  @Watch('current')
  checkCurrent (newValue: boolean): void {
    this.isCurrent = newValue
  }

  private toggle = () => {
    this.isCurrent = true
    if (this.isCurrent) {
      this.currentEvent.emit(this.element.id)
    }
  }

  /**
   * Emits when the accordion is current
   */
  @Event() currentEvent: EventEmitter<string>

  render () {
    return (
      <Host onClick={ this.toggle }>
        <mds-icon class="icon" name={ clsx(this.checked && !this.current ? this.iconChecked : this.icon) }/>
        { this.text && <mds-text class="text" typography={ this.typography }>{ this.text }</mds-text> }
      </Host>
    )
  }
}
