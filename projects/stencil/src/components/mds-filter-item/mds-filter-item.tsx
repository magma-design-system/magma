import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { MdsFilterItemEventDetail } from './meta/event-detail'
import { KeyboardManager } from '@common/keyboard-manager'

@Component({
  tag: 'mds-filter-item',
  styleUrl: 'mds-filter-item.css',
  shadow: true,
})
export class MdsFilterItem {

  @Element() private element: HTMLMdsFilterItemElement
  private km = new KeyboardManager()

  /**
   * Sets the component to selected state
   */
  @Prop({ mutable: true, reflect: true }) selected?: boolean

  /**
   * Sets the label of the filter item
   */
  @Prop({ reflect: true }) label: string

  /**
   * Sets the icon of the filter item
   */
  @Prop({ reflect: true }) icon?: string

  /**
   * Sets the value of the component to be used with forms
   */
  @Prop({ reflect: true }) value: string

  private toggle = () => {
    this.selected = !this.selected
    this.selectedEvent.emit({ id: this.element.id, selected: this.selected })
  }

  /**
   * Emits when the element is active
   */
  @Event({ eventName: 'mdsFilterItemSelect' }) selectedEvent: EventEmitter<MdsFilterItemEventDetail>

  componentDidLoad = (): void => {
    this.km.addElement(this.element)
    this.km.attachClickBehavior()
  }

  disconnectedCallback = (): void => {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host tabindex="0" role="button" aria-label={ this.label ?? this.icon } onClick={ this.toggle }>
        { this.icon && <mds-icon aria-hidden="true" name={this.icon} /> }
        { this.label && <mds-text aria-hidden="true" variant="info" typography="caption">{ this.label }</mds-text> }
      </Host>
    )
  }
}
