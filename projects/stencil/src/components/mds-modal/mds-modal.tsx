import { Component, Element, Host, h, State, Prop } from '@stencil/core'
import clsx from 'clsx'

export type ModalAnimationStateType =
  | 'intro'
  | 'outro'

export type ModalAnimationType =
  | 'center'
  | 'left'
  | 'right'
@Component({
  tag: 'mds-modal',
  styleUrl: 'mds-modal.css',
  shadow: true,
})
export class MdsModal {

  private window: boolean = null
  private header: boolean = null
  private actions: boolean = null
  private animationState: ModalAnimationStateType = 'intro'
  @Element() hostElement: HTMLMdsModalElement

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true }) readonly opened?: boolean

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true }) position?: ModalAnimationType = null

  componentWillLoad (): void {
    this.window = this.hostElement.querySelector('[slot="window"]') !== null
    this.header = this.hostElement.querySelector('[slot="header"]') !== null

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
    setTimeout(() => {
      this.animationState = this.animationState === 'intro' ? 'outro' : 'intro'
      this.hostElement.classList.remove(this.animationName(this.animationState === 'intro' ? 'outro' : 'intro'))
      this.hostElement.classList.add(this.animationName(this.animationState))
    }, 500)
  }

  private animationName = (customState: string = null): string => {
    return `animate-${this.position}${customState !== null ? '-' + customState : ''}`
  }

  render () {
    return (
      <Host class={clsx(
        this.opened && this.animationName('opened'),
      )}>
        { this.window
          ?
          <slot name="window"/>
          :
          <div class="window">
            { this.header &&
              <header>
                <slot name="header"/>
              </header>
            }
            <div class="content">
              <slot></slot>
            </div>
            { this.actions &&
              <footer>
                <slot name="actions"/>
              </footer>
            }
          </div>
        }
        { this.window === null && <mds-icon name="action-close" class="close"/> }
      </Host>
    )
  }

}
