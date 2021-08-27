import { Component, Element, Host, h, Prop, Watch } from '@stencil/core'
import clsx from 'clsx'
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
  @Element() hostElement: HTMLMdsModalElement

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true, mutable: true }) opened?: boolean

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true }) position?: ModalPositionType = null

  componentWillLoad (): void {
    this.bottom = this.hostElement.querySelector('[slot="bottom"]') !== null
    this.top = this.hostElement.querySelector('[slot="top"]') !== null
    this.window = this.hostElement.querySelector('[slot="window"]') !== null

    if (this.window && this.position === null) {
      this.position = 'center'
    }

    if (this.position === null) {
      this.position = 'right'
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
  }

  private animationName = (customState: string = null, customPosition: string = null): string => {
    return `animate-${customPosition !== null ? customPosition : this.position}${customState !== null ? '-' + customState : ''}`
  }

  @Watch('position')
  positionChange (newValue: string, oldValue: string): void {
    window.clearTimeout(this.animationDeelay)
    this.hostElement.classList.remove(this.animationName(null, oldValue))
    this.hostElement.classList.remove(this.animationName('intro', oldValue))
    this.hostElement.classList.remove(this.animationName('outro', oldValue))
  }

  private closeWindow = (e:Event): void => {
    this.opened = e.target !== e.currentTarget
  }

  render () {
    return (
      <Host class={clsx(
        this.opened && this.animationName('opened'),
      )} onClick={(e:Event) => { this.closeWindow(e) }}>
        { this.window
          ?
          <slot name="window"/>
          :
          <div class="window">
            { this.top &&
              <slot name="top"/>
            }
            <slot/>
            { this.bottom &&
              <slot name="bottom"/>
            }
          </div>
        }
        { !this.window && <mds-icon name="action-close" class="close"/> }
      </Host>
    )
  }

}
