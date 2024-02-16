import clsx from 'clsx'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import { Component, Element, Event, EventEmitter, Host, h, Listen, Prop, Watch, State } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { ModalPositionType, ModalAnimationStateType } from './meta/types'

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

  private animationDeelay
  private window = false
  private top = false
  private bottom = false
  private animationState: ModalAnimationStateType = 'intro'
  private km = new KeyboardManager()

  @State() stateOpened: boolean
  @Element() host: HTMLMdsModalElement

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true, mutable: true }) opened = false

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true, mutable: true }) position?: ModalPositionType = 'center'

  componentWillLoad (): void {
    this.bottom = this.host.querySelector('[slot="bottom"]') !== null
    this.top = this.host.querySelector('[slot="top"]') !== null
    this.window = this.host.querySelector('[slot="window"]') !== null
    this.stateOpened = this.opened

    if (!this.window) {
      this.position = 'right'
    }

    if (this.window) {
      this.host.querySelector('[slot="window"]')?.setAttribute('role', 'modal')
    }
  }

  componentWillRender (): void {
    this.animationState = this.opened ? 'intro' : 'outro'
    this.host.classList.add(this.animationName())
  }

  componentDidRender (): void {
    this.animationDeelay = window.setTimeout(() => {
      this.animationState = this.animationState === 'intro' ? 'outro' : 'intro'
      this.host.classList.remove(this.animationName(this.animationState === 'intro' ? 'outro' : 'intro'))
      this.host.classList.add(this.animationName(this.animationState))
      window.clearTimeout(this.animationDeelay)
    }, 500)
  }

  componentDidLoad (): void {
    this.km.addElement(this.host, 'host')
    const close = this.host.shadowRoot?.querySelector('.close')
    if (close) this.km.addElement(close as HTMLElement, 'close')
    this.km.attachEscapeBehavior(() => this.closeEvent.emit())
    this.km.attachClickBehavior('close')
  }

  disconnectedCallback (): void {
    this.km.detachEscapeBehavior()
    this.km.detachClickBehavior('close')
  }

  private animationName = (customState = '', customPosition = ''): string => {
    return `to-${customPosition !== '' ? customPosition : this.position}${customState !== '' ? '-' + customState : ''}`
  }

  @Watch('position')
  positionChange (_newValue: string, oldValue: string): void {
    window.clearTimeout(this.animationDeelay)
    this.host.classList.remove(this.animationName('', oldValue))
    this.host.classList.remove(this.animationName('intro', oldValue))
    this.host.classList.remove(this.animationName('outro', oldValue))
  }

  @Watch('opened')
  openedChange (newValue: boolean): void {
    this.stateOpened = newValue
    window.clearTimeout(this.animationDeelay)
  }

  /**
   * Emits when a modal is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsModalClose' }) closeEvent: EventEmitter<void>

  private closeModal = (e:Event): void => {
    if ((e.target as HTMLElement)?.localName !== 'mds-modal') {
      return
    }
    this.opened = e.target !== e.currentTarget
    if (!this.opened) {
      this.closeEvent.emit()
    }
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
      <Host aria-modal={clsx(this.opened ? 'true' : 'false' )} class={clsx(this.stateOpened && this.animationName('opened'))} onClick={(e: Event) => { this.closeModal(e) }}>
        { this.window
          ? <slot name="window"/>
          : <div class={clsx('window', (this.top || this.bottom) && `window-${this.top ? '-top' : ''}${this.bottom ? '-bottom' : ''}`)} role="dialog" part="window">
            { this.top &&
              <slot name="top"/>
            }
            <slot/>
            { this.bottom &&
              <slot name="bottom"/>
            }
          </div>
        }
        { !this.window && <mds-button icon={miBaselineClose} onClick={(e: Event) => { this.closeModal(e) }} class="button-close"></mds-button> }
      </Host>
    )
  }

}
