import clsx from 'clsx'
import { Component, Method, Element, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core'
import { ModalPositionType, ModalAnimationStateType, ModalOverflowType, ModalAnimationStyleType, ModalInteractionType } from './meta/types'
import { cssDurationToMilliseconds } from '@common/unit'
import miBaselineClose from '@icon/mi/baseline/close.svg'

/**
 * @part action-close - Selects the close button of the modal.
 * @part window - Selects the default window element of the modal when used.
 * @slot bottom - Contents that will be placed on bottom of the window. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot default - Contents that will be placed in the center of the window. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot top - Contents that will be placed on top of the window. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot window - Use directly a window component if you need it. Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-modal',
  styleUrl: 'mds-modal.css',
  shadow: true,
})
export class MdsModal {

  private animationDelayTimeout: NodeJS.Timeout
  private window = false
  private top = false
  private bodyOverflow: string
  private bottom = false
  private cssTransitionDuration: string = '500'
  private windowElement: HTMLElement
  private touchStartX: number
  private touchStartY: number
  private touchMargin: number = 50

  @Element() host: HTMLMdsModalElement

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true, mutable: true }) opened?: boolean = false

  /**
   * Specifies if the modal shows the backdrop
   */
  @Prop({ reflect: true, mutable: true }) backdrop?: boolean = true

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true, mutable: true }) position?: ModalPositionType = 'center'

  /**
   * Specifies if the component is animating itself or not
   */
  @Prop({ reflect: true, mutable: true }) animating?: ModalAnimationStateType = 'none'

  /**
   * Specifies if the component is animating itself or not
   */
  @Prop({ reflect: true }) readonly animation?: ModalAnimationStyleType = 'slide'

  /**
   * Specifies if the component prevents the body from scrolling when modal window is opened
   */
  @Prop({ reflect: true }) readonly overflow: ModalOverflowType = 'auto'

  /**
   * Specifies if the component can be closed with close button, or also if the backdrop background is cliccked.
   * If `strict` is selected only the close button can dismiss the component via UI.
   * If `relaxed` is selected the component can be dismissed also by cliccking the backdrop area.
   */
  @Prop({ reflect: true }) readonly interaction: ModalInteractionType = 'relaxed'

  /**
   * Emits when a modal is closed
   */
  @Event({ eventName: 'mdsModalOpen' }) openEvent: EventEmitter<void>

  /**
   * Emits when a modal is totally visible, when the modal intro animation is finished
   */
  @Event({ eventName: 'mdsModalShow' }) showEvent: EventEmitter<void>

  /**
   * Emits when a modal is closed
   */
  @Event({ eventName: 'mdsModalClose' }) closeEvent: EventEmitter<void>

  /**
   * Emits when a modal is totally invisible, can be useful to detach the component when it's hidden and gain memory
   */
  @Event({ eventName: 'mdsModalHide' }) hideEvent: EventEmitter<void>

  private updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.host)
    this.cssTransitionDuration = elementStyles.getPropertyValue('--mds-modal-transition-duration') ?? '500'
  }

  private stopIntroAnimationWindow = (): void => {
    this.animating = 'none'
    this.host.setAttribute('animating', 'none') // wtf?
    this.showEvent.emit()
    clearTimeout(this.animationDelayTimeout)
  }

  private stopOutroAnimationWindow = (): void => {
    this.animating = 'none'
    this.host.setAttribute('animating', 'none')
    this.hideEvent.emit()
    clearTimeout(this.animationDelayTimeout)
  }

  private disableOverflow = (): void => {
    if (document) {
      if (document.body.style.overflow) {
        this.bodyOverflow = document.body.style.overflow
      }
      document.body.style.overflow = 'hidden'
    }
  }

  private enableOverflow = (): void => {
    if (document) {
      if (this.bodyOverflow) {
        document.body.style.overflow = this.bodyOverflow
      } else {
        document.body.style.removeProperty('overflow')
      }
    }
  }

  private animateOpenWindow = (): void => {
    this.animating = 'intro'
    clearTimeout(this.animationDelayTimeout)
    this.animationDelayTimeout = setTimeout(this.stopIntroAnimationWindow.bind(this), cssDurationToMilliseconds(this.cssTransitionDuration))
  }

  private animateCloseWindow = (): void => {
    this.animating = 'outro'
    clearTimeout(this.animationDelayTimeout)
    this.animationDelayTimeout = setTimeout(this.stopOutroAnimationWindow.bind(this), cssDurationToMilliseconds(this.cssTransitionDuration))
  }

  private setTouchStart = (event: TouchEvent): void => {
    this.touchStartX = event.touches[0].clientX
    this.touchStartY = event.touches[0].clientY
  }
  private setTouchEnd = (event: TouchEvent): void => {
    const endX = event.changedTouches[0].clientX
    const endY = event.changedTouches[0].clientY
    const diffX = this.touchStartX - endX
    const diffY = this.touchStartY - endY

    // if is NOT a diagonal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (this.position === 'right' && diffX > 0) return
      if (this.position === 'left' && diffX < 0) return
      if (Math.abs(diffX) > Math.abs(this.touchMargin)) {
        this.opened = undefined
      }
    }
  }

  private addMobileEvents = (): void => {
    this.windowElement.addEventListener('touchstart', this.setTouchStart)
    this.windowElement.addEventListener('touchend', this.setTouchEnd)
  }

  componentWillLoad (): void {
    this.bottom = this.host.querySelector(':scope > [slot="bottom"]') !== null
    this.top = this.host.querySelector(':scope > [slot="top"]') !== null
    this.window = this.host.querySelector(':scope > [slot="window"]') !== null

    if (this.overflow === 'auto' && this.opened) {
      this.disableOverflow()
    }

    if (this.window) {
      this.host.querySelector(':scope > [slot="window"]')?.setAttribute('role', 'dialog')
    }
  }

  componentWillRender (): void {
    this.animating = this.opened ? 'intro' : 'outro'
  }

  componentDidLoad (): void {
    this.windowElement = this.host.shadowRoot?.querySelector('.window') as HTMLElement
    if (this.windowElement) {
      this.addMobileEvents()
    }
    this.updateCSSCustomProps()
  }

  disconnectedCallback (): void {
    this.enableOverflow()
    if (this.windowElement) {
      this.windowElement.removeEventListener('touchstart', this.setTouchStart)
      this.windowElement.removeEventListener('touchend', this.setTouchEnd)
    }
    this.enableOverflow()
  }

  private closeModal = (e:Event, force?: boolean): void => {
    if (!force) {
      if (this.interaction === 'strict') return
      if ((e.target as HTMLElement)?.localName !== 'mds-modal') {
        return
      }
    }

    this.opened = e.target !== e.currentTarget
    if (!this.opened) {
      this.closeEvent.emit()
    }
  }

  @Watch('opened')
  handleOpenProp (newValue: boolean): void {
    if (newValue) {
      if (this.overflow === 'auto') {
        this.disableOverflow()
      }
      this.animateOpenWindow()
      this.openEvent.emit()
      return
    }
    this.opened = undefined
    if (this.overflow === 'auto') {
      this.enableOverflow()
    }
    this.animateCloseWindow()
  }

  @Watch('backdrop')
  handleBackdropProp (newValue?: boolean): void {
    if (newValue === false) {
      this.backdrop = undefined
    }
  }

  @Method()
  async close (): Promise<void> {
    this.opened = undefined
  }

  render () {
    return (
      <Host aria-modal={clsx(this.opened ? 'true' : 'false' )} onMouseDown={(e: Event) => { this.closeModal(e) }}>
        { this.window
          ? <slot name="window"/>
          : <div class={clsx('window', (this.top || this.bottom) && `window-${this.top ? '-top' : ''}${this.bottom ? '-bottom' : ''}`)} part="window">
            { this.top &&
              <slot name="top"/>
            }
            <slot/>
            { this.bottom &&
              <slot name="bottom"/>
            }
          </div>
        }
        { !this.window && <mds-button class="action-close" icon={miBaselineClose} variant="light" tone="text" size="xl" onClick={(e: Event) => { this.closeModal(e, true) }} part="action-close"></mds-button> }
      </Host>
    )
  }
}
