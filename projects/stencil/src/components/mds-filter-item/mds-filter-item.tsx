import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { FilterClickedEvent } from '../mds-filter/meta/interface'

@Component({
  tag: 'mds-filter-item',
  styleUrl: 'mds-filter-item.css',
  shadow: true,
})
export class MdsFilterItem {

  @Element() private element: HTMLMdsFilterItemElement

  /**
   * Sets the component to active state
   */
  @Prop({ mutable: true, reflect: true }) active?: boolean

  /**
   * Sets the label of the filter item
   */
  @Prop() label!: string

  /**
   * Sets the value of the component to be used with forms
   */
  @Prop({ reflect: true }) value!: string

  private toggle = () => {
    this.active = !this.active
    this.activeEvent.emit({ id: this.element.id, active: this.active })
  }
  /**
   * Emits when the element is active
   */
  @Event() activeEvent: EventEmitter<FilterClickedEvent>

  render () {
    return (
      <Host tabindex="0" role="button" aria-label={ this.label } onClick={ this.toggle }>
        { this.label && <mds-text aria-hidden="true" variant="info" typography="caption">{ this.label }</mds-text> }
      </Host>
    )
  }
}
