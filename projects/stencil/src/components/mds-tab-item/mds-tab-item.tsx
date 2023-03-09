import clsx from 'clsx'
import { ButtonIconPositionType, ButtonType, ButtonSizeType } from '@type/button'
import { Component, Host, h, Element, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'

@Component({
  tag: 'mds-tab-item',
  styleUrl: 'mds-tab-item.css',
  shadow: true,
})
export class MdsTabItem {

  @Element() private element: HTMLMdsTabItemElement
  @State() isSelected: boolean

  /**
   * Specifies if the tab item is selected or not
   */
  @Prop() readonly selected?: boolean

  /**
   * The icon displayed in the tab item
   */
  @Prop() readonly icon?: string

  /**
   * Specifies the horizontal position of the icon displayed in the tab item
   */
  @Prop() readonly iconPosition?: ButtonIconPositionType = 'left'

  /**
   * The type of the tab item element
   */
  @Prop() readonly type?: ButtonType = 'submit'

  /**
   * Specifies the size for the tab item
   */
  @Prop({ reflect: true }) readonly size?: ButtonSizeType = 'md'

  private toggle = () => {
    this.isSelected = !this.isSelected
    if (this.isSelected) {
      this.selectedEvent.emit(this.element.id)
    }
  }

  /**
   * Emits when the tab item is selected
   */
  @Event({ eventName: 'mdsTabItemSelect' }) selectedEvent: EventEmitter<string>

  @Watch('selected')
  validateActive (newValue: boolean): void {
    this.isSelected = newValue
  }

  render () {
    return (
      <Host onClick={this.toggle}>
        <mds-button class={clsx('button', this.selected && 'button--selected')}
          icon={this.icon}
          iconPosition={this.iconPosition}
          size={this.size}
          type={this.type}
        >
          <slot/>
        </mds-button>
      </Host>
    )
  }

}
