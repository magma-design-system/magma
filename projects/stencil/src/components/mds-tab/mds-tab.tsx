import { Component, Element, Event, EventEmitter, Host, Listen, h, Prop, Watch, State } from '@stencil/core'
import { MdsTabEventDetail } from './meta/event-detail'
import { MdsTabItemEventDetail } from '@component/mds-tab-item/meta/event-detail'
import { setAttributeIfEmpty } from '@common/aria'
import { HorizontalActionsAnimationType } from '@type/animation'
import { hashRandomValue } from '@common/aria'
import clsx from 'clsx'
import { cssDurationToMilliseconds } from '@common/unit'

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
  private overflowInit: boolean = false
  private cssSlideDelayDuration: string
  @State() sliderWidth: number = -1
  @State() sliderOffset: number = -1
  @State() overflowLeft: boolean = false
  @State() overflowRight: boolean = false

  /**
   * Shows the horizontal scrollbar to maximize accessibility
   */
  @Prop({ reflect: true, mutable: true }) scrollbar?: boolean

  /**
   * Sets the animation type of the selection transition between `mds-tab-item` elements
   */
  @Prop({ reflect: true }) readonly animation?: HorizontalActionsAnimationType = 'slide'

  /**
   * Sets if the tab area should fill the entire width
   */
  @Prop({ reflect: true, mutable: true }) fill?: boolean

  /**
   * Sets if the tab area should show an inset shadow when the tabs overflows it's container
   */
  @Prop({ reflect: true, mutable: true }) overflow?: boolean

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

  disconnectedCallback ():void {
    this.unsetOverflowCheck()
  }

  componentDidLoad (): void {
    this.updateCSSCustomProps()
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
    this.initOverflowCheck()
  }

  private unsetOverflowCheck = (): void => {
    this.overflowInit = false
    this.tabs.removeEventListener('scroll', this.updateOverflowState)
    this.observer.unobserve(this.tabsContainer)
  }

  private initOverflowCheck = (): void => {
    if (this.overflowInit) return
    this.overflowInit = true
    this.tabs.addEventListener('scroll', this.updateOverflowState)
    this.observer = new ResizeObserver(() => {
      this.updateOverflowState()
    })
    this.observer.observe(this.tabsContainer)
    this.updateOverflowState()
  }

  private updateOverflowState = (): void => {
    if (!this.tabs || !this.tabsContainer) return

    const containerWidth = this.tabsContainer.offsetWidth
    const tabsWidth = this.tabs.scrollWidth
    const { scrollLeft } = this.tabs

    this.overflowLeft = scrollLeft > 0
    this.overflowRight = scrollLeft + containerWidth < tabsWidth
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
    setTimeout(() => {
      this.tabs.scrollLeft = tabItem.offsetLeft - this.tabs.offsetLeft - (this.tabs.offsetWidth / 2) + (tabItem.offsetWidth / 2)
      requestAnimationFrame(() => this.updateOverflowState())
    }, cssDurationToMilliseconds(this.cssSlideDelayDuration))
  }

  private selectContentItem = (): void => {
    this.contentItems.forEach((item: HTMLElement, index: number) => {
      // TODO [bug, react] on React attribute mds-tab-content-hidden is not added onLoad
      item.setAttribute('mds-tab-content-hidden', '')
      if (index === this.currentItem) {
        item.removeAttribute('mds-tab-content-hidden')
      }
    })
  }

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.element)
    this.cssSlideDelayDuration = elementStyles.getPropertyValue(
      '--mds-tab-slide-delay',
    )
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
  handleAnimationChange (newValue: HorizontalActionsAnimationType): void {
    if (newValue === 'slide') {
      this.updateSliderPosition()
      return
    }
    this.slider = null
  }

  @Watch('scrollbar')
  handleScrollbarChange (newValue?: boolean): void {
    if (newValue === false) {
      this.scrollbar = undefined
    }
  }

  @Watch('fill')
  handleFillChange (newValue?: boolean): void {
    if (newValue === false) {
      this.fill = undefined
    }
  }

  @Watch('overflow')
  handleOverflowChange (newValue?: boolean): void {
    if (newValue === false) {
      this.overflow = undefined
      this.unsetOverflowCheck()
      return
    }
    this.initOverflowCheck()
  }

  render () {
    return (
      <Host>
        <div class={clsx('tabs-wrapper', this.fill && 'tabs-wrapper--fill')}>
          { this.overflow && <div class={clsx('tabs-wrapper-overflow-left', this.overflowLeft && 'tabs-wrapper-overflow-left--show')}></div> }
          { this.overflow && <div class={clsx('tabs-wrapper-overflow-right', this.overflowRight && 'tabs-wrapper-overflow-right--show')}></div> }
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
