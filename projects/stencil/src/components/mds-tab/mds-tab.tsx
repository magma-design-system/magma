import clsx from 'clsx'
import { Component, Element, Event, EventEmitter, Host, Listen, h, Prop, Watch } from '@stencil/core'
import { DirectionType } from './meta/type'
import { MdsTabEventDetail } from './meta/event-detail'
import { cssDurationToMilliseconds } from '@common/unit'

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
  private lastKnownContentsScrollX: number
  private contents: HTMLElement
  private tabs: HTMLElement
  private ticking: boolean
  private content: NodeListOf<HTMLElement>

  /**
   * Sets component's contents to be swappable on mobile devices, this will result in forcing direction attribute to be se to 'natural'
   */
  @Prop({ reflect: true }) readonly touch: boolean = false

  /**
   * Sets the direction where tab contents swipes
   */
  @Prop({ mutable: true, reflect: true }) direction: DirectionType = 'natural'

  /**
   * Emits when a children is changed
   */
  @Event({ eventName: 'mdsTabChange' }) changedEvent: EventEmitter<MdsTabEventDetail>

  private queryItems = ():NodeListOf<HTMLMdsTabItemElement> =>
    this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')

  private attachContents = (): void => {
    const items = this.queryItems()
    this.contents = this.element.shadowRoot?.querySelector('.contents') as HTMLElement
    this.contents.innerHTML = ''
    if (items) {
      items.forEach((el: Element) => {
        const wrapper = document.createElement('div')
        wrapper.classList.add('content')
        wrapper.innerHTML = el.innerHTML
        this.contents.appendChild(wrapper)
      })
      this.content = this.element.shadowRoot?.querySelectorAll('.content') as NodeListOf<HTMLElement>
      this.checkTouchContent()
    }
  }

  private checkTouchContent = (): void => {
    if (!this.touch) {
      this.content.forEach((el: Element) => {
        el.classList.add('content--absolute')
      })
      return
    }

    this.content.forEach((el: Element) => {
      el.classList.remove('content--absolute')
    })
  }

  private getCurrentItemHeight = (): number => {
    return (this.content[this.currentItem] as HTMLElement).offsetHeight
  }

  private setContentsHeight = (height: number): void => {

    this.contents.style.setProperty('--mds-tab-contents-height', `${this.contents.offsetHeight}px`)
    setTimeout(() => {
      this.contents.style.setProperty('--mds-tab-contents-height', `${height}px`)
    }, 1)

    if (this.previousItem >= 0) {
      this.content[this.previousItem].classList.add('content--absolute')
    }
    this.content[this.currentItem].classList.remove('content--absolute')

    this.contentsHeightTimeout = setTimeout(() => {
      this.resetHeight()
    }, this.cssAnimationDuration)
  }

  private moveItems = (nextItemDirection: 'left'|'right'): void => {
    const prevItemDirection = nextItemDirection === 'left' ? 'right' : 'left'

    if (this.previousItem >= 0) {
      this.content[this.previousItem].classList.add(`content--animate-to-${prevItemDirection}`)
    }
    this.content[this.currentItem].classList.add(`content--animate-from-${nextItemDirection}`)

    this.moveItemsTimeout = setTimeout(() => {
      this.resetAnimations()
    }, this.cssAnimationDuration)
  }

  private resetHeight = (): void => {
    this.contents.style.setProperty('--mds-tab-contents-height', 'auto')
    this.content[this.currentItem].classList.remove('content--absolute')
    if (this.previousItem >= 0) {
      this.content[this.previousItem].classList.remove('content--hidden')
    }
  }

  private resetAnimations = (): void => {
    this.content.forEach((el: HTMLElement) => {
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
    this.tabs = this.element.shadowRoot?.querySelector('.tabs') as HTMLElement
    this.attachContents()
    this.handleTouchAttribute()
  }

  private updateCSSCustomProps ():void {
    const elementStyles = window.getComputedStyle(this.element)
    this.cssAnimationDuration = cssDurationToMilliseconds(elementStyles.getPropertyValue('--mds-tab-duration'))
  }

  private scrollTabs = (): void => {
    console.log('scrollTabs')
    const items = this.queryItems()
    const tabItem = items[this.currentItem]
    this.tabs.scrollLeft = tabItem.offsetLeft - this.tabs.offsetLeft - (this.tabs.offsetWidth / 2) + (tabItem.offsetWidth / 2)
  }

  private selectTabItemFromScroll = (scrollItem: number): void => {
    const items = this.queryItems()
    if (scrollItem !== this.currentItem) {
      this.scrollTabs()
    }
    items.forEach((item, key) => {
      if (key === scrollItem) {
        item.selected = true
        this.currentItem = key
      } else {
        item.selected = false
      }
    })
  }

  private findCurrentItem = (): void => {
    const contentBox = this.content[0].getBoundingClientRect()
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.lastKnownContentsScrollX = Math.abs(contentBox.left - this.contents.offsetLeft)
        const foundItem = Math.round(this.lastKnownContentsScrollX * this.content.length / (contentBox.width * this.content.length))
        this.selectTabItemFromScroll(foundItem)
        this.ticking = false
      })
      this.ticking = true
    }
  }

  private scrollToContent = (): void => {
    const contentBox = this.content[0].getBoundingClientRect()
    console.log('scrollToContent', - (contentBox.width * this.currentItem))
    this.contents.scrollLeft = - (contentBox.width * this.currentItem)

    this.contents.addEventListener('scrollend', () => {
      console.log('scrollend')
      const contentBox = this.content[this.currentItem].getBoundingClientRect()
      this.contents.style.setProperty('--mds-tab-contents-height', `${contentBox.height}px`)
    })
  }

  @Watch('touch')
  handleTouchAttribute (): void {
    if (!this.touch) {
      this.updateCSSCustomProps()
      this.swipeContent()
      this.contents.removeEventListener('scroll', this.findCurrentItem.bind(this))
      return
    }

    this.contents.addEventListener('scroll', this.findCurrentItem.bind(this))
    this.direction = 'natural'
    this.checkTouchContent()
  }

  @Listen('mdsTabItemSelect')
  changeEventHandler (event: CustomEvent<string>): void {
    const items = this.queryItems()

    if (!this.touch) {
      clearTimeout(this.contentsHeightTimeout)
      clearTimeout(this.moveItemsTimeout)
      this.resetAnimations()
      this.resetHeight()
    }

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
    if (!this.touch) {
      this.swipeContent()
      return
    }

    this.scrollToContent()
  }

  render () {
    return (
      <Host>
        <div class="tabs" part="tabs">
          <slot/>
        </div>
        <div class={clsx('contents', this.touch && 'contents--touch')} part="contents"></div>
      </Host>
    )
  }

}
