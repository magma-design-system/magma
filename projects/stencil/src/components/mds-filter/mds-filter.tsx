import { Component, Element, Event, EventEmitter, Host, h, Listen, Prop, State } from '@stencil/core'
import clsx from 'clsx'
import { FilterClickedEvent } from '../mds-filter/meta/interface'

@Component({
  tag: 'mds-filter',
  styleUrl: 'mds-filter.css',
  shadow: true,
})
export class MdsFilter {

  @Element() private element: HTMLMdsFilterElement

  @State() active?: boolean
  @State() itemsActive = 0

  /**
   * Sets an automatic reset of active filters if all filters are triggered
   */
  @Prop() autoReset?: boolean

  /**
   * Sets the label of the filter group
   */
  @Prop() label?: string

  /**
   * Sets if the filter group can filter multiple filters simultaneously
   */
  @Prop() multiple?: boolean

  private queryItems = ():NodeListOf<HTMLMdsFilterItemElement> =>
    this.element.querySelectorAll<HTMLMdsFilterItemElement>('mds-filter-item')

  private checkActivation = ():void => {
    const items = this.queryItems()
    let active = false
    items.forEach(item => {
      if (item.active) {
        active = true
      }
    })
    this.active = active
  }

  private resetItems = (event: Event):void => {
    if (!this.autoReset) {
      return
    }
    // event.target.style.pointerEvents = 'none'
    const items = this.queryItems()
    items.forEach(item => {
      item.active = false
      item.classList.remove('sibling')
    })
    this.active = false
  }

  private itemsValues = ():string => {
    const items = this.queryItems()
    const list = []
    items.forEach((item, key) => {
      if (item.active) {
        list.push(item.value)
      }
    })
    return list.toString()
  }

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `item-${key}`)
    this.checkActivation()
  }

  @Listen('activeEvent')
  activeEventHandler (event: CustomEvent<FilterClickedEvent>): void {
    const items = this.queryItems()
    if (this.multiple) {
      let itemsActive = 0
      const list = []
      items.forEach((item, key) => {
        item.active ? list.push(item) : list.push(null)
        if (item.active) {
          itemsActive += 1
        }
        item.classList.remove('sibling')
        if (list.length > 1 && list[key - 1] !== null) {
          item.classList.add('sibling')
        }
      })
      this.itemsActive = itemsActive
      this.checkActivation()
      if (this.itemsActive === items.length) {
        this.resetItems(event)
      }
      this.changedEvent.emit(this.itemsValues())
      return
    }

    items.forEach((item, key) => item.active = `item-${key}` === event.detail.id && (event.detail.active))
    this.checkActivation()
    this.changedEvent.emit(this.itemsValues())
  }

  /**
   * Emits when the one of the children is changed
   */
  @Event() changedEvent: EventEmitter<string>

  render () {
    return (
      <Host aria-label={ this.label }>
        { this.label && <mds-text class="label" typography="label">{ this.label }</mds-text> }
        <div class={clsx('items', this.active && 'active')}>
          <slot/>
        </div>
      </Host>
    )
  }
}
