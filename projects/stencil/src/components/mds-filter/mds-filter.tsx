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
  private lastItemActive: number

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

  /**
   * Shows a reset button if one or more filters are active
   */
  @Prop() reset?: boolean

  private queryItems = ():NodeListOf<HTMLMdsFilterItemElement> =>
    this.element.querySelectorAll<HTMLMdsFilterItemElement>('mds-filter-item')

  private scrollTabs = (): void => {
    const items = this.queryItems()
    const tabItem = items[this.lastItemActive]
    const itemsContainer = this.element.shadowRoot.querySelector<HTMLElement>('.items')
    itemsContainer.scrollLeft = tabItem.offsetLeft - itemsContainer.offsetLeft - (itemsContainer.offsetWidth / 2) + (tabItem.offsetWidth / 2)
  }

  private checkActivation = ():void => {
    const items = this.queryItems()
    let active = false
    items.forEach((item, key) => {
      if (item.active) {
        active = true
      }
    })
    this.active = active
  }

  private checkAutoReset = ():void => {
    if (!this.autoReset) {
      return
    }
    this.resetItems()
  }

  private resetItems = ():void => {
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
    items.forEach(item => {
      if (item.active) {
        list.push(item.value)
      }
    })
    return list.toString()
  }

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => {
      item.id = `item-${key}`
    })
    this.checkActivation()
  }

  @Listen('activeEvent')
  activeEventHandler (event: CustomEvent<FilterClickedEvent>): void {
    this.lastItemActive = Number(event.detail.id ? event.detail.id.replace('item-', '') : 0)
    this.scrollTabs()

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
        this.checkAutoReset()
      }
      this.changedEvent.emit(this.itemsValues())
      return
    }

    items.forEach((item, key) => {
      item.active = `item-${key}` === event.detail.id && (event.detail.active)
    })
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
          { this.reset && <div class={clsx('reset', this.active && 'reset-opened')}>
            <mds-filter-item active={this.active} class={clsx('reset-button', this.active && 'reset-button-opened')} icon="mi/baseline/close" onClick={this.resetItems}/>
          </div> }
        </div>
      </Host>
    )
  }
}
