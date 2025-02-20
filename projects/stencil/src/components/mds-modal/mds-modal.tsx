import clsx from 'clsx'
import { Component, Element, Event, EventEmitter, Host, h, Listen, Prop, Watch } from '@stencil/core'
import { ModalPositionType, ModalAnimationStateType, ModalOverflowType } from './meta/types'
import { cssDurationToMilliseconds } from '@common/unit'

/**
 * @slot default - Contents that will be placed in the center of the window. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot bottom - Contents that will be placed on bottom of the window. Add `text string`, `HTML elements` or `components` to this slot.
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
  private cssTransitionDuration: string

  @Element() host: HTMLMdsModalElement

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true, mutable: true }) opened = false

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true, mutable: true }) position?: ModalPositionType = 'center'

  /**
   * Specifies if the component is animating itself or not
   */
  @Prop({ reflect: true, mutable: true }) animating?: ModalAnimationStateType = 'none'

  /**
   * Specifies if the component prevents the body from scrolling when modal window is opened
   */
  @Prop({ reflect: true }) readonly overflow: ModalOverflowType = 'auto'

  /**
   * Emits when a modal is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsModalClose' }) closeEvent: EventEmitter<void>

  /**
   * Emits when a modal is totally invisible, can be useful to detach the component when it's hidden and gain memory
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsModalHide' }) hideEvent: EventEmitter<void>

  private updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.host)
    this.cssTransitionDuration = elementStyles.getPropertyValue('--mds-modal-transition-duration') ?? '500'
  }

  private stopIntroAnimationWindow = (): void => {
    this.animating = 'none'
    this.host.setAttribute('animating', 'none') // wtf?
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

  componentWillLoad (): void {
    this.bottom = this.host.querySelector('[slot="bottom"]') !== null
    this.top = this.host.querySelector('[slot="top"]') !== null
    this.window = this.host.querySelector('[slot="window"]') !== null

    if (this.overflow === 'auto' && this.opened) {
      this.disableOverflow()
    }

    if (this.window) {
      this.host.querySelector('[slot="window"]')?.setAttribute('role', 'dialog')
    }
  }

  componentWillRender (): void {
    this.animating = this.opened ? 'intro' : 'outro'
  }

  componentDidLoad (): void {
    this.updateCSSCustomProps()
  }

  private closeModal = (e:Event): void => {
    if ((e.target as HTMLElement)?.localName !== 'mds-modal') {
      return
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
      return
    }
    if (this.overflow === 'auto') {
      this.enableOverflow()
    }
    this.animateCloseWindow()
  }

  @Listen('mdsModalClose', { target: 'document' })
  onModalCloseListener (): void {
    this.opened = false
  }

  @Listen('mdsBannerClose', { target: 'document' })
  onBannerCloseListener (): void {
    this.opened = false
  }

  render () {
    return (
      <Host aria-modal={clsx(this.opened ? 'true' : 'false' )} onClick={(e: Event) => { this.closeModal(e) }}>
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
        { !this.window && <mds-button class="action-close" icon="mi/baseline/close" variant="light" tone="quiet" size="xl" onClick={(e: Event) => { this.closeModal(e) }}></mds-button> }
      </Host>
    )
  }
}
