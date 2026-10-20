import { cssDurationToMilliseconds } from '@common/unit';
import { preferenceStore } from '@common/preference';
import { Locale } from '@common/locale';
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
import { ButtonVariantType } from '@type/button';
import { ThemeVariantType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';

import clsx from 'clsx';
import miBaselineArrowDownward from '@icon/mi/baseline/arrow-downward.svg';
import miBaselineArrowUpward from '@icon/mi/baseline/arrow-upward.svg';
import { MdsToastCloseEventDetail } from './meta/event-detail';
import { ToastPosition } from './meta/types';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

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
  // what is left of the countdown, undefined when there is none; it only runs while neither the
  // pointer nor the focus is inside the toast
  private remaining?: number;
  private countdownStart = 0;
  private pointerInside = false;
  private focusInside = false;
  // who hid the toast, read by the close that follows: the application, unless the timer or
  // the hide button say otherwise
  private closeReason: MdsToastCloseEventDetail['reason'] = 'hide';
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @Element() hostElement: HTMLMdsToastElement;
  @State() hasActions: boolean;

  /**
   * If set, specifies the visibility duration in milliseconds of the element inside the viewport, when the time is up the visible property will be set to false. The countdown waits while the pointer is over the toast or the focus is inside it. If the duration is set to 0 the toast stays until it is hidden: give it `deletable` so the person can hide it too.
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
   * Shows a button that hides the toast, an arrow towards the edge the toast leaves by
   */
  @Prop() readonly deletable?: boolean;

  /**
   * Emits once the toast is hidden and its exit animation is over, whoever hid it: the `reason` of
   * the detail says who, `timeout`, `close` (the person, with the hide button) or `hide` (the application)
   */
  @Event({ eventName: 'mdsToastClose' }) closedEvent: EventEmitter<MdsToastCloseEventDetail>;

  // mdsToastClose waits for the exit transition, so it reads the duration the transition really
  // has: --mds-toast-duration, or 0s when the motion preference removes it. An invalid value
  // leaves the transition at 0s too
  private updateCSSCustomProps(): void {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.hostElement);
    this.cssDismissAnimationDuration = cssDurationToMilliseconds(
      elementStyles.getPropertyValue('--private-toast-transition-duration'),
      0,
    );
  }

  // a removed attribute leaves null, which counts as no duration, like 0
  private hasDuration = (): boolean => {
    const duration = this.duration ?? 0;
    return duration !== 0 && !Number.isNaN(duration);
  };

  private stopCountdown = (): void => {
    window.clearTimeout(this.dismissTimer);
    this.dismissTimer = undefined;
  };

  private runCountdown = (): void => {
    if (this.remaining === undefined || this.dismissTimer !== undefined) {
      return;
    }
    if (this.pointerInside || this.focusInside) {
      return;
    }
    this.countdownStart = Date.now();
    this.dismissTimer = window.setTimeout(() => {
      this.dismissTimer = undefined;
      this.remaining = undefined;
      this.hide('timeout');
    }, this.remaining);
  };

  // the time spent counting is gone, the rest waits for the pointer and the focus to leave
  private holdCountdown = (): void => {
    if (this.dismissTimer === undefined || this.remaining === undefined) {
      return;
    }
    this.stopCountdown();
    this.remaining = Math.max(0, this.remaining - (Date.now() - this.countdownStart));
  };

  /**
   * While the toast is visible with a duration, one countdown hides it when the time is up, and
   * mdsToastClose follows once the exit animation is over. The countdown is one-shot: it was an
   * interval that nobody stopped, so a dismissed toast emitted mdsToastClose again every
   * `duration`. Hiding the toast, showing it again or changing the duration starts from scratch.
   * The countdown waits while the pointer is over the toast or the focus is inside it, so its
   * action is not taken away while the person is reaching it (WCAG 2.2.1).
   */
  private reloadTimeListeners = (visible: boolean): void => {
    if (typeof window === 'undefined') return;
    this.stopCountdown();
    this.remaining = visible && this.hasDuration() ? this.duration : undefined;
    this.runCountdown();
  };

  private hide = (reason: MdsToastCloseEventDetail['reason']): void => {
    this.closeReason = reason;
    this.visible = false;
  };

  private onCloseClick = (): void => {
    this.hide('close');
  };

  private onPointerEnter = (): void => {
    this.pointerInside = true;
    this.holdCountdown();
  };

  private onPointerLeave = (): void => {
    this.pointerInside = false;
    this.runCountdown();
  };

  private onFocusIn = (): void => {
    this.focusInside = true;
    this.holdCountdown();
  };

  // the focus moving from one control of the toast to another sends the focusin of the next one
  // right after: the countdown goes on and stops again in the same task
  private onFocusOut = (): void => {
    this.focusInside = false;
    this.runCountdown();
  };

  // the hide button takes the colour of the text of the toast: the variants without a style of
  // their own are drawn as dark
  private closeButtonVariant = (): ButtonVariantType => {
    switch (this.variant) {
      case 'light':
        return 'dark';
      case 'error':
      case 'info':
      case 'success':
      case 'warning':
        return this.variant;
      default:
        return 'light';
    }
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
  visibleChanged(visible: boolean, wasVisible?: boolean): void {
    // read again when the toast hides: the preference or the property may have changed since load
    this.updateCSSCustomProps();
    const reason = this.closeReason;
    this.closeReason = 'hide';
    if (!visible) {
      // a hidden toast leaves the pointer and the focus behind without telling: the boundary
      // events come only when the pointer moves, and a control that turns hidden loses the
      // focus silently. The next showing starts its countdown from a clean state
      this.pointerInside = false;
      this.focusInside = false;
    }
    this.reloadTimeListeners(visible);
    if (visible) {
      // shown again before the close of the last showing: that close is no longer true
      window.clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
      return;
    }
    if (!wasVisible) {
      return;
    }
    window.clearTimeout(this.closeTimer);
    this.closeTimer = window.setTimeout(() => {
      this.closeTimer = undefined;
      this.closedEvent.emit({ reason });
    }, this.cssDismissAnimationDuration);
  }

  @Watch('duration')
  durationChanged(): void {
    this.reloadTimeListeners(!!this.visible);
  }

  render() {
    // a status region: the message is announced when the toast shows it, without moving the
    // focus. The host is the region and stays in the page, so the content that appears inside
    // it is what a screen reader reads out
    return (
      <Host
        role="status"
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
          onFocusin={this.onFocusIn}
          onFocusout={this.onFocusOut}
          onPointerEnter={this.onPointerEnter}
          onPointerLeave={this.onPointerLeave}
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
          {this.deletable && (
            <mds-button
              aria-label={this.t.get('hide')}
              class="hide"
              icon={
                this.position?.startsWith('top') ? miBaselineArrowUpward : miBaselineArrowDownward
              }
              onClick={this.onCloseClick}
              size="sm"
              tone="text"
              type="button"
              variant={this.closeButtonVariant()}
            />
          )}
        </div>
      </Host>
    );
  }
}
