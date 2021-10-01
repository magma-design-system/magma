import { Component, Host, h, Element, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-tab-item',
  styleUrl: 'mds-tab-item.css',
  shadow: false,
})
export class MdsTabItem {

  @Element() private element: HTMLMdsTabItemElement;
  @State() isSelected: boolean

  /**
   * Specifies if the tab item is selected or not
   */
  @Prop() readonly selected?: boolean

  private toggle = () => {
    this.isSelected = !this.isSelected
    if (this.isSelected) {
      this.selectedEvent.emit(this.element.id)
    }
  }

  /**
   * Emits when the tab item is selected
   */
  @Event() selectedEvent: EventEmitter<string>

  @Watch('selected')
  validateActive (newValue: boolean): void {
    this.isSelected = newValue
  }

  render () {
    return (
      <Host slot="tab-item" onClick={this.toggle}>
        <mds-button class={clsx('button', this.selected && 'button--selected')}>
          <span slot="text">
            <slot/>
          </span>
        </mds-button>
      </Host>
    )
  }

}
