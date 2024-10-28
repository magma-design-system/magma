import { Component, Element, Event, EventEmitter, Host, Listen, State, h, Prop, Watch } from '@stencil/core'
import { MdsHeaderEventDetail } from './meta/event-detail'
import { HeaderBarMenuType, HeaderBarNavType } from '@type/header-bar'
import { AppearanceType } from './meta/types'

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
  private currentPosition: number = 0
  private scrollingUpMargin: number = 0
  private sanitizedAppearance: AppearanceType = ['stripe']
  private appearanceThreshold: number = 300

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
   * Sets the visibility type of the hamburger menu of mds-header-bar
   */
  @Prop({ reflect: true }) readonly menu: HeaderBarMenuType = 'mobile'

  /**
   * Sets the visibility type of the navigation menu of mds-header-bar
   */
  @Prop({ reflect: true }) readonly nav: HeaderBarNavType = 'desktop'

  /**
   * Sets the threshold margin to trigger hide or show status of the `mds-header-bar`
   */
  @Prop({ reflect: true }) readonly threshold: number = 1

  /**
   * Sets the visibility type of the navigation menu of mds-header-bar
   */
  @Prop({ reflect: true, mutable: true }) visibility?: 'hidden' | 'visible'

  /**
   * Emits when the component is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsHeaderClose' }) closedEvent: EventEmitter<MdsHeaderEventDetail>

  private mobileMenu = (): HTMLElement => {
    return this.host.querySelector('[slot="menu"]') as HTMLElement
  }

  private headerBar = (): HTMLMdsHeaderBarElement => {
    return this.host.querySelector('mds-header-bar') as HTMLMdsHeaderBarElement
  }

  private close = () => {
    this.isOpened = false
    this.closedEvent.emit({ bar: this.headerBar() })
  }

  private handleVisibility = (): void => {
    if (this.currentPosition > window.scrollY) {
      this.scrollingUpMargin += 1
    } else {
      this.scrollingUpMargin = 0
    }

    this.currentPosition = window.scrollY

    if (this.scrollingUpMargin >= this.threshold) {
      this.visibility = 'visible'
      return
    }

    if (this.autoHide && this.currentPosition > this.autoHide) {
      this.visibility = 'hidden'
      return
    }
    this.visibility = 'visible'
  }

  private sanitizeAppearance = (): AppearanceType => {
    const regex = /\b(\w+)\b/g
    if (!this.appearanceSet) {
      return [this.appearance]
    }
    const matches = this.appearanceSet.match(regex)
    if (matches) {
      return matches as AppearanceType
    }
    return [this.appearance]
  }

  private handleAppearance = (): void => {
    if (this.currentPosition >= this.appearanceThreshold) {
      this.appearance = this.sanitizedAppearance[1] ?? this.appearance
      return
    }
    this.appearance = this.sanitizedAppearance[0] ?? this.appearance
  }

  private handleScroll = (): void => {
    if (this.autoHide) {
      this.handleVisibility()
    }
    if (!this.autoHide) {
      this.currentPosition = window.scrollY
    }
    if (this.sanitizedAppearance.length > 1) {
      this.handleAppearance()
    }
  }

  private initScrollListener = (): void => {
    if (!window) {
      return
    }
    this.sanitizedAppearance = this.sanitizeAppearance()
    this.appearanceThreshold = this.sanitizedAppearance[2] ?? 300
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

  componentDidLoad (): void {
    this.initScrollListener()
  }

  @Listen('mdsHeaderBarOpen', { target: 'document' })
  onModalOpenedHandler (): void {
    this.isOpened = true
  }

  @Watch('menu')
  onMenuChangedHandler (newValue: HeaderBarMenuType): void {
    const headerBar = this.headerBar()
    if (headerBar){
      headerBar.setAttribute('menu', newValue)
    }
  }

  @Watch('nav')
  onNavChangedHandler (newValue: HeaderBarNavType): void {
    const headerBar = this.headerBar()
    if (headerBar) {
      headerBar.setAttribute('nav', newValue)
    }
  }

  render () {
    return (
      <Host>
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
