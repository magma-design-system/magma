import { Component, Event, EventEmitter, Host, h, Prop, State, Watch } from '@stencil/core'
import { TypographySmallerType } from '@type/typography'

@Component({
  tag: 'mds-tab-bar-item',
  styleUrl: 'mds-tab-bar-item.css',
  shadow: true,
})
export class MdsTabBarItem {

  @State() isSelected:boolean

  @Prop() readonly icon?: string

  /**
   * Specifies if the component is selected or not
   */
  @Prop({ mutable: true, reflect: true }) selected?: boolean

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographySmallerType = 'tip'

  componentWillLoad (): void {
    this.isSelected = this.selected
  }

  private select = () => {
    this.isSelected = !this.isSelected
    if (this.isSelected) {
      this.selectedEvent.emit()
    }
  }

  /**
   * Emits when the component is selected
   */
  @Event({ eventName: 'mdsTabBarItemSelect' }) selectedEvent: EventEmitter<void>

  @Watch('selected')
  validateSelected (newValue: boolean): void {
    this.isSelected = newValue
  }

  render () {
    return (
      <Host onClick={ this.select }>
        <mds-icon name={this.icon}/>
        <mds-text typography={this.typography}>
          <slot/>
        </mds-text>
      </Host>
    )
  }
}
