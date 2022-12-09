import { Component, Element, Host, h, Listen, Prop, State } from '@stencil/core'
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

  /**
   * Sets the label of the filter group
   */
  @Prop() label?: string

  /**
   * Choose if multiple siblings can be opened simultaneously
   */
  @Prop() multiple?: boolean

  private queryItems = ():NodeListOf<HTMLMdsFilterItemElement> =>
    this.element.querySelectorAll<HTMLMdsFilterItemElement>('mds-filter-item')

  private checkActivation = () => {
    const items = this.queryItems()
    let active = false
    items.forEach(item => {
      if (item.active) {
        active = true
      }
    })
    this.active = active
  }

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `item-${key}`)
    this.checkActivation()
  }

  @Listen('activeEvent')
  activeEventHandler (event: CustomEvent<FilterClickedEvent>): void {
    console.log('activeEvent')
    const items = this.queryItems()
    if (this.multiple) {
      const list = []
      items.forEach((item, key) => {
        item.active ? list.push(item) : list.push(null)
        item.classList.remove('sibling')
        if (list.length > 1 && list[key - 1] !== null) {
          item.classList.add('sibling')
        }
      })
      this.checkActivation()
      return
    }
    items.forEach((item, key) => item.active = `item-${key}` === event.detail.id && (event.detail.active))
    this.checkActivation()
  }

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
