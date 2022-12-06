import { Component, Element, Event, EventEmitter, Host, h, Listen, Prop, Watch, State } from '@stencil/core'
import clsx from 'clsx'
import { ModalPositionType, ModalAnimationStateType } from './meta/types'
import miBaselineClose from '@icon/mi/baseline/close.svg'

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
  @State() stateOpened: boolean
  @Element() hostElement: HTMLMdsModalElement

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true, mutable: true }) opened?: boolean

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true, mutable: true }) position?: ModalPositionType = null

  componentWillLoad (): void {
    this.bottom = this.hostElement.querySelector('[slot="bottom"]') !== null
    this.top = this.hostElement.querySelector('[slot="top"]') !== null
    this.window = this.hostElement.querySelector('[slot="window"]') !== null
    this.stateOpened = this.opened

    if (this.window && this.position === null) {
      this.position = 'center'
    }

    if (this.position === null) {
      this.position = 'right'
    }

    if (this.window) {
      const modal = this.hostElement.querySelector('[slot="window"]')
      modal.setAttribute('role', 'modal')
    }
  }

  componentWillRender (): void {
    this.animationState = this.opened ? 'intro' : 'outro'
    this.hostElement.classList.add(this.animationName())
  }

  componentDidRender (): void {
    this.animationDeelay = window.setTimeout(() => {
      this.animationState = this.animationState === 'intro' ? 'outro' : 'intro'
      this.hostElement.classList.remove(this.animationName(this.animationState === 'intro' ? 'outro' : 'intro'))
      this.hostElement.classList.add(this.animationName(this.animationState))
      window.clearTimeout(this.animationDeelay)
    }, 500)

    if (this.opened) {
      this.addKeyboardEscapeListener()
      return
    }

    this.removeKeyboardEscapeListener()
  }

  disconnectedCallback (): void {
    this.removeKeyboardEscapeListener()
  }

  private animationName = (customState: string = null, customPosition: string = null): string => {
    return `animate-${customPosition !== null ? customPosition : this.position}${customState !== null ? '-' + customState : ''}`
  }

  @Watch('position')
  positionChange (_newValue: string, oldValue: string): void {
    window.clearTimeout(this.animationDeelay)
    this.hostElement.classList.remove(this.animationName(null, oldValue))
    this.hostElement.classList.remove(this.animationName('intro', oldValue))
    this.hostElement.classList.remove(this.animationName('outro', oldValue))
  }

  private checkKeyboardEscape = (event: KeyboardEvent): void => {
    if (event.code === 'Escape') {
      this.close.emit()
    }
  }

  private addKeyboardEscapeListener (): void {
    window.addEventListener('keydown', this.checkKeyboardEscape.bind(this))
  }

  private removeKeyboardEscapeListener (): void {
    window.removeEventListener('keydown', this.checkKeyboardEscape.bind(this))
  }

  @Watch('opened')
  openedChange (newValue: boolean): void {
    this.stateOpened = newValue
    window.clearTimeout(this.animationDeelay)

    if (newValue) {
      this.addKeyboardEscapeListener()
      return
    }

    this.removeKeyboardEscapeListener()
  }

  /**
   * Emits when a modal is closed
   */
  @Event({ bubbles: true, composed: true }) close: EventEmitter<void>

  private closeModal = (e:Event = null): void => {
    if ((e.target as HTMLElement)?.localName !== 'mds-modal') {
      return
    }
    this.opened = e.target !== e.currentTarget
    if (!this.opened) {
      this.close.emit()
    }
  }

  @Listen('close', { target: 'document' })
  onCloseListener (): void {
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
        { !this.window && <i innerHTML={miBaselineClose} class="svg close"/> }
      </Host>
    )
  }

}
