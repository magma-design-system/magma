import clsx from 'clsx'
import { Component, Element, Event, EventEmitter, Host, h, Listen, Prop, State } from '@stencil/core'
import { MdsFilterEventDetail } from './meta/event-detail'
import { MdsFilterItemEventDetail } from '@component/mds-filter-item/meta/event-detail'
import miBaselineClose from '@icon/mi/baseline/close.svg'

/**
 * @slot default - Add `mds-filter-item` element/s.
 */

@Component({
  tag: 'mds-filter',
  styleUrl: 'mds-filter.css',
  shadow: true,
})
export class MdsFilter {

  @Element() private element: HTMLMdsFilterElement

  @State() active?: boolean
  @State() itemsSelected = 0
  private lastSelectedItem: number

  /**
   * Sets an automatic reset of active filters if all filters are triggered
   */
  @Prop({ reflect: true }) autoReset?: boolean

  /**
   * Sets the label of the filter group
   */
  @Prop() label?: string

  /**
   * Sets if the filter group can filter multiple filters simultaneously
   */
  @Prop({ reflect: true }) multiple?: boolean

  /**
   * Shows a reset button if one or more filters are active
   */
  @Prop({ reflect: true }) reset?: boolean

  private queryItems = ():NodeListOf<HTMLMdsFilterItemElement> =>
    this.element.querySelectorAll<HTMLMdsFilterItemElement>('mds-filter-item')

  private scrollTabs = (): void => {
    const items = this.queryItems()
    const tabItem = items[this.lastSelectedItem]
    const itemsContainer = this.element.shadowRoot?.querySelector<HTMLElement>('.items')
    if (itemsContainer) {
      itemsContainer.scrollLeft = tabItem.offsetLeft - itemsContainer.offsetLeft - (itemsContainer.offsetWidth / 2) + (tabItem.offsetWidth / 2)
    }
  }

  private checkSelectedItem = ():void => {
    const items = this.queryItems()
    let active = false
    items.forEach(item => {
      if (item.selected) {
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
      item.selected = false
      item.classList.remove('sibling')
    })
    this.active = false
  }

  private itemsValues = ():string => {
    const items = this.queryItems()
    const list: string[] = []
    items.forEach(item => {
      if (item.selected) {
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
    this.checkSelectedItem()
  }

  @Listen('mdsFilterItemSelect')
  activeEventHandler (event: CustomEvent<MdsFilterItemEventDetail>): void {
    this.lastSelectedItem = Number(event.detail.id ? event.detail.id.replace('item-', '') : 0)
    this.scrollTabs()

    const items = this.queryItems()

    if (this.multiple) {
      let itemsSelected = 0
      const list: (HTMLMdsFilterItemElement | null)[] = []
      items.forEach((item, key) => {
        item.selected ? list.push(item) : list.push(null)
        if (item.selected) {
          itemsSelected += 1
        }
        item.classList.remove('sibling')
        if (list.length > 1 && list[key - 1] !== null) {
          item.classList.add('sibling')
        }
      })
      this.itemsSelected = itemsSelected
      this.checkSelectedItem()
      if (this.itemsSelected === items.length) {
        this.checkAutoReset()
      }
      this.changedEvent.emit({ children: items, value: this.itemsValues() })
      return
    }

    items.forEach((item, key) => {
      item.selected = `item-${key}` === event.detail.id && (event.detail.selected)
    })
    this.checkSelectedItem()
    this.changedEvent.emit({ children: items, value: this.itemsValues() })
  }

  /**
   * Emits when the one of the children is changed
   */
  @Event({ eventName: 'mdsFilterChange' }) changedEvent: EventEmitter<MdsFilterEventDetail>

  render () {
    return (
      <Host aria-label={ this.label } role="menubar">
        { this.label && <mds-text class="label" typography="label">{ this.label }</mds-text> }
        <div class="items-wrapper">
          <div class={clsx('items', this.active && 'active')}>
            <slot/>
            <div class={clsx('reset', this.active && 'reset--opened')}>
              <mds-filter-item selected={this.active} disabled={!this.active && this.reset} class={clsx('reset-button', this.active && 'reset-button-opened')} icon={miBaselineClose} onClick={this.resetItems}/>
            </div>
          </div>
        </div>
      </Host>
    )
  }
}
