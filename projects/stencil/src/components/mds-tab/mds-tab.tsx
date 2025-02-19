import { Component, Element, Event, EventEmitter, Host, Listen, h, Prop, Watch, State } from '@stencil/core'
import { MdsTabEventDetail } from './meta/event-detail'
import { MdsTabItemEventDetail } from '@component/mds-tab-item/meta/event-detail'
import { setAttributeIfEmpty } from '@common/aria'
import { HorizontalActionsAnimationType } from '@type/animation'
import { hashRandomValue } from '@common/aria'
import clsx from 'clsx'

/**
 * @part contents - Selects the container of the tabbed contents elements.
 * @part slider - Selects the slider element which is visible when attribute `animation` is set to `slide`.
 * @part tabs - Selects the container of `mds-tab-item` list elements.
 * @slot content - Add `HTML elements` or `components`, one per mds-tab-item added.
 * @slot default - Add `mds-tab-item` element/s.
 */

@Component({
  tag: 'mds-tab',
  styleUrl: 'mds-tab.css',
  shadow: true,
})
export class MdsTab {

  @Element() private element: HTMLMdsTabElement
  private currentItem: number = -1
  private slider: HTMLDivElement | null
  private tabs: HTMLElement
  private tabsContainer: HTMLElement
  private observer: ResizeObserver
  private tabItems: NodeListOf<HTMLMdsTabItemElement>
  private contentItems: NodeListOf<HTMLElement>
  @State() sliderWidth: number = -1
  @State() sliderOffset: number = -1

  /**
   * Shows the horizontal scrollbar to maximize accessibility
   */
  @Prop({ reflect: true }) readonly scrollbar?: boolean

  /**
   * Sets the animation type of the selection transition between `mds-tab-item` elements
   */
  @Prop({ reflect: true }) readonly animation?: HorizontalActionsAnimationType = 'slide'

  /**
   * Sets if the tab area should fill the entire width
   */
  @Prop({ reflect: true }) readonly fill?: boolean

  /**
   * Emits when a children is changed
   */
  @Event({ eventName: 'mdsTabChange' }) changedEvent: EventEmitter<MdsTabEventDetail>

  private queryContentItems = (): NodeListOf<HTMLElement> =>
    this.element.querySelectorAll<HTMLElement>('[slot=content]')

  disonnectedCallback (): void {
    this.observer.unobserve(this.tabsContainer)
  }

  private startObserver = (): void => {
    this.observer = new ResizeObserver(() => {
      if (this.animation === 'slide') {
        this.updateSliderPosition(true)
      }
    })
    this.observer.observe(this.tabsContainer)
  }

  componentWillLoad (): void {
    this.tabItems = this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')
    this.tabItems.forEach((item, key) => {
      if (!item.id) {
        setAttributeIfEmpty(item, 'id', hashRandomValue('mds-tab-item'))
      }
      if (item.selected) {
        this.currentItem = key
      }
    })
  }

  componentDidLoad (): void {
    this.tabs = this.element.shadowRoot?.querySelector('.tabs') as HTMLElement
    this.tabsContainer = this.element.shadowRoot?.querySelector('.tabs-wrapper') as HTMLElement
    this.startObserver()
    this.contentItems = this.queryContentItems()
    this.contentItems.forEach((item: HTMLElement, key: number): void => {
      setAttributeIfEmpty(item, 'role', 'tabpanel')
      setAttributeIfEmpty(item, 'aria-labelledby', this.tabItems[key].id)
    })
    this.selectContentItem()
    if (this.animation === 'slide') {
      this.updateSliderPosition()
    }
  }

  private updateSliderPosition = (disableAnimation?: boolean): void => {
    if (!this.slider) {
      this.setSlider()
    }
    if (this.slider && this.currentItem >= 0) {
      if (disableAnimation) {
        this.slider.classList.add('slider--no-trantitions')
      }
      this.sliderWidth = this.tabItems[this.currentItem].offsetWidth
      this.sliderOffset = this.tabItems[this.currentItem].offsetLeft - this.tabsContainer.offsetLeft
      this.slider.classList.remove('slider--no-trantitions')
    }
  }

  private setSlider = (): void => {
    this.slider = this.element.shadowRoot?.querySelector('.slider') as HTMLDivElement
  }

  private scrollTabs = (key: number): void => {
    const tabItem = this.tabItems[key]
    this.tabs.scrollLeft = tabItem.offsetLeft - this.tabs.offsetLeft - (this.tabs.offsetWidth / 2) + (tabItem.offsetWidth / 2)
  }

  private selectContentItem = (): void => {
    this.contentItems.forEach((item: HTMLElement, index: number) => {
      item.setAttribute('mds-tab-content-hidden', '')
      if (index === this.currentItem) {
        item.removeAttribute('mds-tab-content-hidden')
      }
    })
  }

  @Listen('mdsTabItemSelect')
  changeEventHandler (event: CustomEvent<MdsTabItemEventDetail>): void {
    // since the external developer can define a custom id
    // we must find the key from event.detail
    this.tabItems.forEach((item, key: number) => {
      if (item.id === event.detail.target.id) {
        item.selected = true
        this.changedEvent.emit({ id: key, value: item.value })
        this.currentItem = key
        this.scrollTabs(key)
      } else {
        item.selected = false
      }
    })
    this.selectContentItem()

    if (this.animation === 'slide') {
      this.updateSliderPosition()
    }
  }

  @Listen('mdsTabItemFocus')
  focusEventHandler (event: CustomEvent<MdsTabItemEventDetail>): void {
    this.tabItems.forEach((item, key: number) => {
      if (item.id === event.detail.target.id) {
        this.scrollTabs(key)
      }
    })
  }

  @Watch('animation')
  handleAnimation (newValue: HorizontalActionsAnimationType): void {
    if (newValue === 'slide') {
      this.updateSliderPosition()
      return
    }
    this.slider = null
  }

  render () {
    return (
      <Host>
        <div class={clsx('tabs-wrapper', this.fill && 'tabs-wrapper--fill')}>
          <div class="tabs" part="tabs" role="tablist">
            <slot />
            { this.animation === 'slide' &&
              <div class="slider" part="slider" style={{
                '--mds-tab-slider-width': `${this.sliderWidth}px`,
                '--mds-tab-slider-offset': `${this.sliderOffset}px`,
              }}></div>
            }
          </div>
        </div>
        { this.contentItems &&
        <div class="contents" part="contents">
          <slot name="content"/>
        </div>
        }
      </Host>
    )
  }

}
