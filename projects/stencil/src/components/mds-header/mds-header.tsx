import { Component, Element, Event, EventEmitter, Host, State, h, Prop, Watch, Method } from '@stencil/core'
import { MdsHeaderEventDetail, MdsHeaderVisibilityEventDetail } from './meta/event-detail'
import { HeaderBarMenuType, HeaderBarNavType } from '@type/header-bar'
import { AppearanceType } from './meta/types'
// import clsx from 'clsx'

/**
 * @part menu - The container element of the modal
 * @slot default - Add `mds-header-bar` element/s.
 * @slot menu - Put actions and other contents that will be shown as mobile menu. Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-header',
  styleUrl: 'mds-header.css',
  shadow: true,
})
export class MdsHeader {

  @Element() host: HTMLMdsHeaderElement
  @State() hasMenu: boolean
  @State() isOpened: boolean
  private relativeTresholdDown = 0
  private relativePosition = 0
  private relativeThresholdUp = 0
  private sanitizedAppearance: AppearanceType = ['stripe']
  private appearanceThreshold = 300
  private headerBar: HTMLMdsHeaderBarElement

  /**
   * Sets the appearance of the header bar element when loaded,
   * it can be changed depending on how `appearance-set` attribute is set
   */
  @Prop({ reflect: true, mutable: true }) appearance: string = 'stripe'

  /**
   * Sets the appearance of the header bar element depending on the scroll position
   * you should set three different values: initial appearance, changed appearance and `window.scrollY` threshold
   * Es: appearance-set="stripe, inline 200" means the component will start with stripe appearance
   * that will change to inline if the page is scrolled more of 199 pixels
   */
  @Prop({ reflect: true }) readonly appearanceSet?: string

  /**
   * When the page is scrolled down, the component mds-header-bar is hidden starting
   * from the `autoHide` attribute's value, then if the page is scrolled up it is shown again
   */
  @Prop({ reflect: true }) readonly autoHide?: number

  /**
   * Sets if the backdrop is shown when the mds-header-bar attribute appearace is set to `inline`
   */
  @Prop({ reflect: true }) readonly backdrop?: boolean = true

  /**
   * Sets the visibility type of the hamburger menu of mds-header-bar
   */
  @Prop({ reflect: true }) readonly menu: HeaderBarMenuType = 'mobile'

  /**
   * Sets the visibility type of the navigation menu of mds-header-bar
   */
  @Prop({ reflect: true }) readonly nav: HeaderBarNavType = 'desktop'

  /**
   * Sets the threshold margin to trigger hide or show status of the `mds-header-bar` when the page is scrolled
   */
  @Prop({ reflect: true }) readonly threshold: number = 1

  /**
   * Sets the visibility type of the navigation menu of mds-header-bar
   */
  @Prop({ reflect: true, mutable: true }) visibility?: 'hidden' | 'visible' = 'visible'

  /**
   * Emits when the component is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsHeaderClose' }) closedEvent: EventEmitter<MdsHeaderEventDetail>

  /**
   * Emits when the component mds-header-bar is shown or hidden
   */
  @Event({ eventName: 'mdsHeaderVisibilityChange' }) visibleEvent: EventEmitter<MdsHeaderVisibilityEventDetail>

  @Method()
  async setOpened (isOpened: boolean = true): Promise<void> {
    this.isOpened = isOpened
  }

  private mobileMenu = (): HTMLElement => {
    return this.host.querySelector('[slot="menu"]') as HTMLElement
  }

  private close = () => {
    this.isOpened = false
    this.closedEvent.emit({ bar: this.headerBar })
    this.headerBar.setOpened(false)
  }

  private handleVisibility = (): void => {

    if (!this.autoHide) {
      return
    }
    // reset var if the page is scrolled to top
    if (window.scrollY < this.autoHide) {
      this.visibility = 'visible'
      this.relativeThresholdUp = 0
      this.relativeTresholdDown = 0
      this.relativePosition = 0
      return
    }

    if (this.relativeTresholdDown - window.scrollY <= 0) {
      this.visibility = 'hidden'
      this.relativePosition = this.relativeTresholdDown
    }

    if (this.relativeThresholdUp - window.scrollY >= this.threshold) {
      this.visibility = 'visible'
      this.relativeThresholdUp = window.scrollY
      this.relativePosition = this.relativeThresholdUp
    }

    // set hidden for the first scroll from top
    if (this.relativePosition < this.autoHide && this.autoHide - window.scrollY <= 0) {
      this.visibility = 'hidden'
      this.relativePosition = this.autoHide
    }

    // update respective threshold if page is scrolled up or down
    if (window.scrollY > this.relativeThresholdUp) {
      this.relativeThresholdUp = window.scrollY
    } else {
      this.relativeTresholdDown = window.scrollY + this.threshold
    }
  }

  private sanitizeAppearance = (): AppearanceType => {
    if (!this.appearanceSet) {
      return [this.appearance]
    }
    const regex = /\b(\w+)\b/g
    const matches = this.appearanceSet.match(regex)
    if (matches) {
      return matches as AppearanceType
    }
    return [this.appearance]
  }

  private handleAppearance = (): void => {
    if (window.scrollY >= this.appearanceThreshold) {
      this.appearance = this.sanitizedAppearance[1] ?? this.appearance
      return
    }
    this.appearance = this.sanitizedAppearance[0] ?? this.appearance
  }

  private handleScroll = (): void => {
    if (typeof window === 'undefined') return
    if (this.autoHide) {
      this.handleVisibility()
    }
    if (this.sanitizedAppearance.length > 1) {
      this.handleAppearance()
    }
  }

  private setAppearanceSetData = (): void => {
    this.sanitizedAppearance = this.sanitizeAppearance()
    if (this.sanitizedAppearance[2]) {
      this.appearanceThreshold = this.sanitizedAppearance[2]
    }
    this.relativeTresholdDown = this.threshold
  }

  private initScrollListener = (): void => {
    if (!window) {
      return
    }
    this.setAppearanceSetData()
    window.addEventListener('scroll', this.handleScroll)
  }

  disconnectedCallback (): void {
    if (!window) {
      return
    }
    window.removeEventListener('scroll', this.handleScroll)
  }

  componentWillLoad (): void {
    this.hasMenu = this.mobileMenu() !== null
    if (this.hasMenu) {
      this.onMenuChangedHandler(this.menu)
      return
    }
    this.onMenuChangedHandler('none')
  }

  private defineHeaderBar = (): void => {
    this.headerBar = this.host.querySelector('mds-header-bar') as HTMLMdsHeaderBarElement
  }

  componentDidLoad (): void {
    this.defineHeaderBar()
    this.onMenuChangedHandler(this.menu)
    this.onNavChangedHandler(this.nav)
    this.initScrollListener()
  }

  @Watch('menu')
  onMenuChangedHandler (newValue: HeaderBarMenuType, oldValue?: HeaderBarMenuType): void {
    if (newValue === oldValue) {
      return
    }
    if (this.headerBar){
      this.headerBar.menu = newValue
    }
  }

  @Watch('nav')
  onNavChangedHandler (newValue: HeaderBarNavType, oldValue?: HeaderBarMenuType): void {
    if (newValue === oldValue) {
      return
    }
    if (this.headerBar) {
      this.headerBar.nav = newValue
    }
  }

  @Watch('appearanceSet')
  onAppearanceSetChangedHandler (): void {
    this.setAppearanceSetData()
  }

  @Watch('visibility')
  handleVisibilityChange (newValue: boolean, oldValue: boolean): void {
    if (newValue !== oldValue) {
      this.visibleEvent.emit({ visibility: newValue })
    }
  }

  render () {
    return (
      <Host>
        { this.backdrop && <div class="backdrop"></div> }
        <slot />
        {this.hasMenu &&
          <div class="menu" part="menu">
            <mds-modal class="modal" opened={this.isOpened} onMdsModalClose={this.close} position="right">
              <slot name="menu" />
            </mds-modal>
          </div>
        }
      </Host>
    )
  }
}
