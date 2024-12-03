import { cssDurationToMilliseconds } from '@common/unit'
import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core'
import { ThemeLuminanceVariantType, ToneMinimalVariantType } from '@type/variant'
import clsx from 'clsx'
import { ToastPosition } from './meta/types'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 * @slot icon - Insert an icon image, it can be `HTML elements` or `components`, it is **recommended** to add `mds-icon` element.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 */

@Component({
  tag: 'mds-toast',
  styleUrl: 'mds-toast.css',
  shadow: true,
})
export class MdsToast {

  private timer: number
  private timerToastDismiss: number
  private cssDismissAnimationDuration = 300 // hardcoded from CSS :-(
  private actions: boolean
  private hasText?: boolean

  @Element() hostElement: HTMLMdsToastElement

  /**
   * If set, specifies the visibility duration in milliseconds of the element inside the viewport, when the time is up the visible property will be set to false. If the duration is set to 0 the component will still visible until intentionally closed by user.
   */
  @Prop({ mutable: true, reflect: true }) readonly duration?: number = 5000

  /**
   * Specifies if toast is visible at the bottom or not
   */
  @Prop({ mutable: true, reflect: true }) visible?: boolean

  /**
   * Sets the theme variant colours
   */
  @Prop({ reflect: true }) readonly variant?: ThemeLuminanceVariantType = 'light'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'strong'

  /**
   * Sets position of toast
   */
  @Prop({ reflect: true, mutable: true }) readonly position: ToastPosition = 'bottom-center'
  /**
   * Emits when the accordion is opened
   */
  @Event({ eventName: 'mdsToastClose' }) closedEvent: EventEmitter<void>

  private updateCSSCustomProps (): void {
    if (typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.hostElement)
    this.cssDismissAnimationDuration = cssDurationToMilliseconds(elementStyles.getPropertyValue('--mds-tab-duration'))
  }

  private reloadTimeListeners = (visible: boolean): void => {
    if (typeof window === 'undefined') return
    if (!this.duration) {
      return
    }
    if (!visible) {
      return
    }
    this.removeTimeListener()
    this.addTimeListener()
  }

  private removeTimeListener = (): void => {
    window.clearInterval(this.timer)
    this.timer = 0
  }

  private addTimeListener = (): void => {
    this.timer = window.setInterval(() => {
      this.visible = false
      this.timerToastDismiss = window.setInterval(() => {
        // this is used to wait the toast to finish the outro animation
        this.closedEvent.emit()
        window.clearInterval(this.timerToastDismiss)
        this.timerToastDismiss = 0
      }, this.cssDismissAnimationDuration)
    }, this.duration)
  }

  componentWillLoad (): void {
    this.hasText = this.hostElement.innerHTML !== ''
    this.actions = this.hostElement.querySelector('[slot="action"]') !== null
    if (!this.duration) {
      return
    }
    if (this.visible) {
      this.addTimeListener()
    }
  }

  componentDidLoad (): void {
    this.updateCSSCustomProps()
  }

  @Watch('visible')
  visibleChanged (visible: boolean): void {
    this.reloadTimeListeners(visible)
  }

  @Watch('duration')
  durationChanged (): void {
    this.reloadTimeListeners(!!this.visible)
  }

  render () {
    return (
      <Host>
        <div class={clsx('dialog', this.position && `to-${this.position}`, this.visible && 'dialog--visible')}>
          <slot name="icon" />
          {this.hasText &&
            <mds-text typography="caption">
              <slot />
            </mds-text>
          }
          {this.actions &&
            <div class="actions">
              <slot name="action" />
            </div>
          }
        </div>
      </Host>
    )
  }

}
