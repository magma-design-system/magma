import { cssDurationToMilliseconds } from '@common/unit';
import { preferenceStore } from '@common/preference';
import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import { ThemeVariantType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';

import clsx from 'clsx';
import { ToastPosition } from './meta/types';

/**
 * @slot - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 * @slot icon - Insert an icon image, it can be `HTML elements` or `components`, it is **recommended** to add `mds-icon` element.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 */

@Component({
  tag: 'mds-toast',
  styleUrl: 'mds-toast.css',
  shadow: true,
})
export class MdsToast {
  private dismissTimer?: number;
  private closeTimer?: number;
  private cssDismissAnimationDuration = 300; // hardcoded from CSS :-(
  private hasText?: boolean;

  @Element() hostElement: HTMLMdsToastElement;
  @State() hasActions: boolean;

  /**
   * If set, specifies the visibility duration in milliseconds of the element inside the viewport, when the time is up the visible property will be set to false. If the duration is set to 0 the component will still visible until intentionally closed by user.
   */
  @Prop({ mutable: true, reflect: true }) readonly duration?: number = 5000;

  /**
   * Specifies if toast is visible at the bottom or not
   */
  @Prop({ mutable: true, reflect: true }) visible?: boolean;

  /**
   * Sets the theme variant colours
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'light';

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'strong';

  /**
   * Sets position of toast
   */
  @Prop({ reflect: true, mutable: true }) readonly position: ToastPosition = 'bottom-center';
  /**
   * Emits when the accordion is opened
   */
  @Event({ eventName: 'mdsToastClose' }) closedEvent: EventEmitter<void>;

  private updateCSSCustomProps(): void {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.hostElement);
    this.cssDismissAnimationDuration = cssDurationToMilliseconds(
      elementStyles.getPropertyValue('--mds-tab-duration'),
    );
  }

  // a removed attribute leaves null, which counts as no duration, like 0
  private hasDuration = (): boolean => {
    const duration = this.duration ?? 0;
    return duration !== 0 && !Number.isNaN(duration);
  };

  /**
   * While the toast is visible with a duration, one countdown hides it when the time is up, and
   * mdsToastClose follows once the exit animation is over. Both are one-shot: the countdown was
   * an interval that nobody stopped, so a dismissed toast emitted mdsToastClose again every
   * `duration`. Hiding the toast, or showing it again, starts from scratch.
   */
  private reloadTimeListeners = (visible: boolean): void => {
    if (typeof window === 'undefined') return;
    window.clearTimeout(this.dismissTimer);
    this.dismissTimer = undefined;
    if (!visible || !this.hasDuration()) {
      return;
    }
    // shown again before the close of the last showing: that close is no longer true
    window.clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
    this.dismissTimer = window.setTimeout(() => {
      this.dismissTimer = undefined;
      this.visible = false;
      this.closeTimer = window.setTimeout(() => {
        this.closeTimer = undefined;
        this.closedEvent.emit();
      }, this.cssDismissAnimationDuration);
    }, this.duration);
  };

  disconnectedCallback(): void {
    window.clearTimeout(this.dismissTimer);
    window.clearTimeout(this.closeTimer);
    this.dismissTimer = undefined;
    this.closeTimer = undefined;
  }

  private onActionSlotChange = (): void => {
    this.hasActions = hasChildWithSlot(this.hostElement, 'action');
  };

  componentWillLoad(): void {
    this.hasText = this.hostElement.innerHTML !== '';
    this.hasActions = hasChildWithSlot(this.hostElement, 'action');
    this.reloadTimeListeners(!!this.visible);
  }

  componentDidLoad(): void {
    this.updateCSSCustomProps();
  }

  @Watch('visible')
  visibleChanged(visible: boolean): void {
    this.reloadTimeListeners(visible);
  }

  @Watch('duration')
  durationChanged(): void {
    this.reloadTimeListeners(!!this.visible);
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div
          class={clsx(
            'dialog',
            this.position && `to-${this.position}`,
            this.visible && 'dialog--visible',
          )}
        >
          <slot name="icon" />
          {this.hasText && (
            <mds-text typography="caption">
              <slot />
            </mds-text>
          )}
          <div class={clsx('actions', !this.hasActions && 'actions--hidden')}>
            <slot name="action" onSlotchange={this.onActionSlotChange} />
          </div>
        </div>
      </Host>
    );
  }
}
