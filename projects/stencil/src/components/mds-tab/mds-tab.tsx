import { Component, Element, Event, EventEmitter, Host, Listen, h, Prop } from '@stencil/core'
import { MdsTabEventDetail } from './meta/event-detail'
import { cssDurationToMilliseconds } from '@common/unit'
import { DirectionType } from './meta/type'

@Component({
  tag: 'mds-tab',
  styleUrl: 'mds-tab.css',
  shadow: true,
})
export class MdsTab {

  @Element() private element: HTMLMdsTabElement
  private currentItem: number
  private previousItem = -1
  private cssAnimationDuration: number
  private contentsHeightTimeout: NodeJS.Timeout
  private moveItemsTimeout: NodeJS.Timeout

  /**
   * Sets the direction where tab contents swipes
   */
  @Prop({ reflect: true }) readonly direction: DirectionType = 'natural'

  /**
   * Emits when a children is changed
   */
  @Event({ eventName: 'mdsTabChange' }) changedEvent: EventEmitter<MdsTabEventDetail>

  private queryItems = ():NodeListOf<HTMLMdsTabItemElement> =>
    this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')

  private attachContents = (): void => {
    const items = this.element.querySelectorAll('mds-tab-item')
    const contents = this.element.shadowRoot?.querySelector('.contents') as HTMLElement
    contents.innerHTML = ''
    if (items) {
      items.forEach((el: Element) => {
        const wrapper = document.createElement('div')
        wrapper.classList.add('content')
        wrapper.classList.add('content--absolute')
        wrapper.innerHTML = el.innerHTML
        contents.appendChild(wrapper)
      })
    }
  }

  private getCurrentItemHeight = (): number => {
    const content = this.element.shadowRoot?.querySelectorAll('.content') as NodeListOf<HTMLElement>
    return (content[this.currentItem] as HTMLElement).offsetHeight
  }

  private setContentsHeight = (height: number): void => {
    const contents = this.element.shadowRoot?.querySelector('.contents') as HTMLElement
    const content = this.element.shadowRoot?.querySelectorAll('.content') as NodeListOf<HTMLElement>

    contents.style.setProperty('--mds-tab-contents-height', `${contents.offsetHeight}px`)
    setTimeout(() => {
      contents.style.setProperty('--mds-tab-contents-height', `${height}px`)
    }, 1)

    if (this.previousItem >= 0) {
      content[this.previousItem].classList.add('content--absolute')
    }
    content[this.currentItem].classList.remove('content--absolute')

    this.contentsHeightTimeout = setTimeout(() => {
      this.resetHeight()
    }, this.cssAnimationDuration)
  }

  private moveItems = (nextItemDirection: 'left'|'right'): void => {
    const prevItemDirection = nextItemDirection === 'left' ? 'right' : 'left'
    const content = this.element.shadowRoot?.querySelectorAll('.content') as NodeListOf<HTMLElement>

    if (this.previousItem >= 0) {
      content[this.previousItem].classList.add(`content--animate-to-${prevItemDirection}`)
    }
    content[this.currentItem].classList.add(`content--animate-from-${nextItemDirection}`)

    this.moveItemsTimeout = setTimeout(() => {
      this.resetAnimations()
    }, this.cssAnimationDuration)
  }

  private resetHeight = (): void => {
    const contents = this.element.shadowRoot?.querySelector('.contents') as HTMLElement
    const content = this.element.shadowRoot?.querySelectorAll('.content') as NodeListOf<HTMLElement>
    contents.style.setProperty('--mds-tab-contents-height', 'auto')
    content[this.currentItem].classList.remove('content--absolute')
    if (this.previousItem >= 0) {
      content[this.previousItem].classList.remove('content--hidden')
    }
  }

  private resetAnimations = (): void => {
    const content = this.element.shadowRoot?.querySelectorAll('.content') as NodeListOf<HTMLElement>
    content.forEach((el: HTMLElement) => {
      el.classList.remove('content--animate-to-left')
      el.classList.remove('content--animate-to-right')
      el.classList.remove('content--animate-from-left')
      el.classList.remove('content--animate-from-right')
    })
  }

  private swipeContent = (): void => {
    this.setContentsHeight(this.getCurrentItemHeight())
    if (this.previousItem === this.currentItem) {
      return
    }
    if (this.previousItem > this.currentItem) {
      if (this.direction === 'natural') {
        this.moveItems('left')
        return
      }
      this.moveItems('right')
      return
    }
    if (this.direction === 'natural') {
      this.moveItems('right')
      return
    }
    this.moveItems('left')
  }

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => {
      if (!item.id) {
        item.id = `mds-tab-item-${key}`
      }
      if (item.selected) {
        this.currentItem = key
      }
    })
  }

  componentDidLoad ():void {
    this.updateCSSCustomProps()
    this.attachContents()
    this.swipeContent()
  }

  private updateCSSCustomProps ():void {
    const elementStyles = window.getComputedStyle(this.element)
    this.cssAnimationDuration = cssDurationToMilliseconds(elementStyles.getPropertyValue('--mds-tab-duration'))
  }

  private scrollTabs = (): void => {
    const items = this.queryItems()
    const tabItem = items[this.currentItem]
    this.element.scrollLeft = tabItem.offsetLeft - this.element.offsetLeft - (this.element.offsetWidth / 2) + (tabItem.offsetWidth / 2)
  }

  @Listen('mdsTabItemSelect')
  changeEventHandler (event: CustomEvent<string>): void {
    const items = this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')

    clearTimeout(this.contentsHeightTimeout)
    clearTimeout(this.moveItemsTimeout)
    this.resetAnimations()
    this.resetHeight()

    items.forEach((item, key) => {
      if (item.selected) {
        this.previousItem = key
      }
    })

    items.forEach((item, key) => {
      if (item.id === event.detail) {
        item.selected = true
        this.changedEvent.emit({ id: key })
        this.currentItem = key
        this.scrollTabs()
      } else {
        item.selected = false
      }
    })
    this.swipeContent()
  }

  render () {
    return (
      <Host>
        <div class="tabs" part="tabs">
          <slot/>
        </div>
        <div class="contents" part="contents"></div>
      </Host>
    )
  }

}
