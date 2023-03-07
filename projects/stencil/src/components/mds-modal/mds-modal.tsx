import clsx from 'clsx'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import { Component, Element, Event, EventEmitter, Host, h, Listen, Prop, Watch, State } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { ModalPositionType, ModalAnimationStateType } from './meta/types'

@Component({
  tag: 'mds-modal',
  styleUrl: 'mds-modal.css',
  shadow: true,
})
export class MdsModal {

  private animationDeelay
  private window: boolean = null
  private top: boolean = null
  private bottom: boolean = null
  private animationState: ModalAnimationStateType = 'intro'
  private km = new KeyboardManager()
  @State() stateOpened: boolean
  @Element() host: HTMLMdsModalElement

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true, mutable: true }) opened?: boolean

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true, mutable: true }) position?: ModalPositionType = null

  componentWillLoad (): void {
    this.bottom = this.host.querySelector('[slot="bottom"]') !== null
    this.top = this.host.querySelector('[slot="top"]') !== null
    this.window = this.host.querySelector('[slot="window"]') !== null
    this.stateOpened = this.opened

    if (this.window && this.position === null) {
      this.position = 'center'
    }

    if (this.position === null) {
      this.position = 'right'
    }

    if (this.window) {
      const modal = this.host.querySelector('[slot="window"]')
      modal.setAttribute('role', 'modal')
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

  componentDidLoad = (): void => {
    this.km.addElement(this.host, 'host')
    this.km.addElement(this.host.shadowRoot.querySelector('.close'), 'close')
    this.km.attachEscapeBehavior(() => this.closeEvent.emit())
    this.km.attachClickBehavior('close')
  }

  disconnectedCallback (): void {
    this.km.detachEscapeBehavior()
    this.km.detachClickBehavior('close')
  }

  private animationName = (customState: string = null, customPosition: string = null): string => {
    return `animate-${customPosition !== null ? customPosition : this.position}${customState !== null ? '-' + customState : ''}`
  }

  @Watch('position')
  positionChange (_newValue: string, oldValue: string): void {
    window.clearTimeout(this.animationDeelay)
    this.host.classList.remove(this.animationName(null, oldValue))
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

  private closeModal = (e:Event = null): void => {
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
          ?
          <slot name="window"/>
          :
          <div class={clsx('window', (this.top || this.bottom) && `window-${this.top ? '-top' : ''}${this.bottom ? '-bottom' : ''}`)} role="dialog">
            { this.top &&
              <slot name="top"/>
            }
            <slot/>
            { this.bottom &&
              <slot name="bottom"/>
            }
          </div>
        }
        { !this.window && <i innerHTML={miBaselineClose} tabindex="0" onClick={(e: Event) => { this.closeModal(e) }} class="svg close focusable-light"/> }
      </Host>
    )
  }

}
