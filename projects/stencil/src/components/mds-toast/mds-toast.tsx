import { Component, Element, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core'
import { ToneVariantType, ThemeLuminanceVariantType } from '../../types/variant'
import clsx from 'clsx'

@Component({
  tag: 'mds-toast',
  styleUrl: 'mds-toast.css',
  shadow: true,
})
export class MdsToast {

  private timer
  private timerToastDismiss
  private dismissAnimationDuration = 300 // hardcoded from CSS :-(
  private actions: boolean
  private hasText?: boolean

  @Element() hostElement: HTMLMdsToastElement

  /**
   * If set, specifies the visibility duration in milliseconds of the element inside the viewport, when the time is up the visible property will be set to false.
   */
  @Prop({ mutable: true, reflect: true }) readonly duration?: number = 5000

  /**
   * Specifies if toast is visible at the bottom or not
   */
  @Prop({ mutable: true, reflect: true }) visible?: boolean

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeLuminanceVariantType = 'light'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'strong'

  /**
   * Emits when the accordion is opened
   */
  @Event() timerFinishedEvent: EventEmitter<void>

  private reloadTimeListeners = (visible: boolean):void => {
    if (!visible) {
      return
    }
    this.removeTimeListener()
    this.addTimeListener()
  }

  private removeTimeListener = (): void => {
    window.clearInterval(this.timer)
    this.timer = null
  }

  private addTimeListener = (): void => {
    this.timer = window.setInterval(() => {
      this.visible = false
      this.timerToastDismiss = window.setInterval(() => {
        // this is used to wait the toast to finish the outro animation
        this.timerFinishedEvent.emit()
        window.clearInterval(this.timerToastDismiss)
        this.timerToastDismiss = null
      }, this.dismissAnimationDuration)
    }, this.duration)
  }

  componentWillLoad (): void {
    this.hasText = this.hostElement.innerHTML !== ''
    this.actions = this.hostElement.querySelector('[slot="action"]') !== null
    if (this.visible) {
      this.addTimeListener()
    }
  }

  @Watch('visible')
  visibleChanged (visible: boolean): void {
    this.reloadTimeListeners(visible)
  }

  @Watch('duration')
  durationChanged (): void {
    this.reloadTimeListeners(this.visible)
  }

  render () {
    return (
      <Host>
        <div class={clsx('dialog', this.visible && 'dialog--visible')}>
          <slot name="icon" />
          { this.hasText &&
            <mds-text typography="caption">
              <slot />
            </mds-text>
          }
          { this.actions &&
            <div class="actions">
              <slot name="action"/>
            </div>
          }
        </div>
      </Host>
    )
  }

}
