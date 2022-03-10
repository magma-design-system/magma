import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-stepper-item',
  styleUrl: 'mds-stepper-item.css',
  shadow: true,
})
export class MdsStepperItem {

  @Element() private element: HTMLMdsAccordionItemElement

  @State() isChecked: boolean
  @State() isCurrent: boolean

  @Prop() readonly text!: string
  @Prop() readonly icon!: string
  @Prop() iconChecked?: string = this.icon

  /**
   * Specifies if the component is checked or not
   */
  @Prop({ reflect: true }) readonly checked?: boolean
  @Prop({ reflect: true }) current?: boolean

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
        <mds-icon class="icon" name={ clsx(this.checked ? this.iconChecked : this.icon) }/>
        <mds-text class="text" typography='detail'>{ this.text }</mds-text>
      </Host>
    )
  }
}
