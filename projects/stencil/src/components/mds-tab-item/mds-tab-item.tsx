import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core'
import { ButtonIconPositionType, ButtonSizeType, ButtonType } from '@type/button'
import { MdsTabItemEventDetail } from './meta/event-detail'

/**
 * @slot default - Put text string here, avoid elements
 */

@Component({
  tag: 'mds-tab-item',
  styleUrl: 'mds-tab-item.css',
  shadow: true,
})
export class MdsTabItem {

  @Element() private element: HTMLMdsTabItemElement
  @State() isSelected: boolean
  @State() hasText: boolean

  /**
   * Specifies if the tab item is selected or not
   */
  @Prop({ reflect: true }) readonly selected?: boolean

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

  /**
   * Specifies an optional value to get from mdsTabItemSelect event
   */
  @Prop({ reflect: true }) readonly value?: string

  /**
   * Specifies the URL target of the button
   */
  @Prop({ reflect: true }) readonly href?: string

  /**
   * Emits when the tab item is selected
   */
  @Event({ eventName: 'mdsTabItemSelect' }) selectedEvent: EventEmitter<MdsTabItemEventDetail>

  /**
   * Emits when the tab item is selected
   */
  @Event({ eventName: 'mdsTabItemFocus' }) focusedEvent: EventEmitter<MdsTabItemEventDetail>

  private toggle = () => {
    this.isSelected = !this.isSelected
    if (this.isSelected) {
      this.selectedEvent.emit({ target: this.element, value: this.value })
    }
  }

  private focus = () => {
    this.focusedEvent.emit({ target: this.element, value: this.value })
  }

  @Watch('selected')
  validateActive (newValue: boolean): void {
    this.isSelected = newValue
    if (this.selected) {
      this.selectedEvent.emit({ target: this.element, value: this.value })
    }
  }

  componentWillLoad ():void {
    this.hasText = this.element.innerHTML !== ''
  }

  render () {
    return (
      <Host onClick={this.toggle}>
        <mds-button class="button"
          onFocus={this.focus}
          icon={this.icon}
          href={this.href}
          iconPosition={this.iconPosition}
          part="button"
          role="tab"
          size={this.size}
          type={this.type}
        >
          { this.hasText && <slot/> }
        </mds-button>
      </Host>
    )
  }

}
