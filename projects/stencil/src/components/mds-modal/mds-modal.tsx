import clsx from 'clsx';
import {
  Component,
  Method,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import {
  ModalPositionType,
  ModalOverflowType,
  ModalAnimationStyleType,
  ModalInteractionType,
} from './meta/types';
import { cssDurationToMilliseconds } from '@common/unit';
import { preferenceStore } from '@common/preference';
import miBaselineClose from '@icon/mi/baseline/close.svg';

/**
 * @part action-close - Selects the close button of the modal.
 * @part window - Selects the default window element of the modal when used.
 * @slot bottom - Contents that will be placed on bottom of the window. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot - Contents that will be placed in the center of the window. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot top - Contents that will be placed on top of the window. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot window - Use directly a window component if you need it. Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-modal',
  styleUrl: 'mds-modal.css',
  shadow: true,
})
export class MdsModal {
  private animationDelayTimeout: NodeJS.Timeout;
  private dialogEl?: HTMLDialogElement;
  // Initialised on purpose: both readers compare it against '' (the strict boolean
  // rules forbid the truthiness check this used to be), and an undeclared field is
  // `undefined`, not ''. See enableOverflow.
  private bodyOverflow: string = '';
  private cssTransitionDuration: string = '500';
  private windowElement: HTMLElement;
  private windowContentWrapper?: HTMLElement;
  private touchStartX: number;
  private touchStartY: number;
  private touchMargin: number = 50;

  @Element() host: HTMLMdsModalElement;
  @State() hasBottom = false;
  @State() hasTop = false;
  @State() hasWindow = false;
  @State() windowHeaderHeight = 0;
  @State() windowFooterHeight = 0;

  /**
   * The accessible name of the modal: the name a screen reader announces when the window
   * opens. The `<dialog>` this component renders is the dialog, so the name goes there.
   */
  @Prop({ attribute: 'aria-label' }) readonly accessibleName?: string;

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true, mutable: true }) opened?: boolean = false;

  /**
   * Hides the modal backdrop
   */
  @Prop({ reflect: true, mutable: true }) hideBackdrop?: boolean = false;

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true, mutable: true }) position?: ModalPositionType = 'center';

  /**
   * Specifies the animation style of the modal window
   */
  @Prop({ reflect: true }) readonly animation?: ModalAnimationStyleType = 'slide';

  /**
   * Specifies if the component prevents the body from scrolling when modal window is opened
   */
  @Prop({ reflect: true }) readonly overflow: ModalOverflowType = 'auto';

  /**
   * Specifies if the component can be closed with close button, or also if the backdrop background is cliccked.
   * If `strict` is selected only the close button can dismiss the component via UI.
   * If `relaxed` is selected the component can be dismissed also by cliccking the backdrop area.
   */
  @Prop({ reflect: true }) readonly interaction: ModalInteractionType = 'relaxed';

  /**
   * Emits when a modal is closed
   */
  @Event({ eventName: 'mdsModalOpen' }) openEvent: EventEmitter<void>;

  /**
   * Emits when a modal is totally visible, when the modal intro animation is finished
   */
  @Event({ eventName: 'mdsModalShow' }) showEvent: EventEmitter<void>;

  /**
   * Emits when a modal is closed
   */
  @Event({ eventName: 'mdsModalClose' }) closeEvent: EventEmitter<void>;

  /**
   * Emits when a modal is totally invisible, can be useful to detach the component when it's hidden and gain memory
   */
  @Event({ eventName: 'mdsModalHide' }) hideEvent: EventEmitter<void>;

  private updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.host);
    this.cssTransitionDuration =
      elementStyles.getPropertyValue('--mds-modal-transition-duration') ?? '500';
  };

  private stopIntroAnimationWindow = (): void => {
    this.setContentOverflow('auto');
    this.showEvent.emit();
    clearTimeout(this.animationDelayTimeout);
  };

  private stopOutroAnimationWindow = (): void => {
    this.hideEvent.emit();
    clearTimeout(this.animationDelayTimeout);
  };

  private disableOverflow = (): void => {
    if (typeof document !== 'undefined') {
      if (document.body.style.overflow !== '') {
        this.bodyOverflow = document.body.style.overflow;
      }
      document.body.style.overflow = 'hidden';
    }
  };

  private enableOverflow = (): void => {
    if (typeof document !== 'undefined') {
      if (this.bodyOverflow !== '') {
        document.body.style.overflow = this.bodyOverflow;
      } else {
        document.body.style.removeProperty('overflow');
      }
    }
  };

  // Freeze the content scroll container (overflow:hidden) for the whole slide,
  // re-enabling it only once the window's transform transition has finished. A
  // live overflow:auto with overflowing content janks the transform. Applied
  // inline on the element on purpose: toggling it via a host attribute + CSS
  // selector triggers a shadow-wide style recalc at the settle frame, which is
  // what caused the visible jump.
  private setContentOverflow = (value: 'auto' | 'hidden'): void => {
    if (this.windowContentWrapper) {
      this.windowContentWrapper.style.overflow = value;
    }
  };

  private handleWindowTransitionEnd = (e: TransitionEvent): void => {
    if (e.propertyName !== 'transform') {
      return;
    }
    if (this.opened) {
      this.stopIntroAnimationWindow();
    } else {
      this.stopOutroAnimationWindow();
    }
  };

  private animateOpenWindow = (): void => {
    this.setContentOverflow('hidden');
    clearTimeout(this.animationDelayTimeout);
    // Fallback only: `handleWindowTransitionEnd` is the primary settle. The
    // buffer keeps this from firing before the transition actually ends.
    this.animationDelayTimeout = setTimeout(
      this.stopIntroAnimationWindow.bind(this),
      cssDurationToMilliseconds(this.cssTransitionDuration) + 100,
    );
  };

  private animateCloseWindow = (): void => {
    this.setContentOverflow('hidden');
    clearTimeout(this.animationDelayTimeout);
    this.animationDelayTimeout = setTimeout(
      this.stopOutroAnimationWindow.bind(this),
      cssDurationToMilliseconds(this.cssTransitionDuration) + 100,
    );
  };

  private setTouchStart = (event: TouchEvent): void => {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  };
  private setTouchEnd = (event: TouchEvent): void => {
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const diffX = this.touchStartX - endX;
    const diffY = this.touchStartY - endY;

    // if is NOT a diagonal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (this.position === 'right' && diffX > 0) return;
      if (this.position === 'left' && diffX < 0) return;
      if (Math.abs(diffX) > Math.abs(this.touchMargin)) {
        this.opened = undefined;
      }
    }
  };

  private addMobileEvents = (): void => {
    this.windowElement.addEventListener('touchstart', this.setTouchStart);
    this.windowElement.addEventListener('touchend', this.setTouchEnd);
  };

  private updateSlots = (): void => {
    this.hasBottom = hasChildWithSlot(this.host, 'bottom');
    this.hasTop = hasChildWithSlot(this.host, 'top');
    this.hasWindow = hasChildWithSlot(this.host, 'window');

    // the slotted window is NOT given a role: the `<dialog>` below is the dialog already,
    // opened with showModal(), and a second one inside it reads as a second window
  };

  /**
   * Measures the header and the footer to pad the content: the states change
   * only when a measure differs, so the update pass settles after one render.
   */
  private updateWindowPaddings = (): void => {
    const header = this.host.shadowRoot?.querySelector('.window-header') as HTMLElement | null;
    const footer = this.host.shadowRoot?.querySelector('.window-footer') as HTMLElement | null;
    const headerHeight = header?.offsetHeight ?? 0;
    const footerHeight = footer?.offsetHeight ?? 0;
    if (headerHeight !== this.windowHeaderHeight) this.windowHeaderHeight = headerHeight;
    if (footerHeight !== this.windowFooterHeight) this.windowFooterHeight = footerHeight;
  };

  componentWillLoad(): void {
    this.updateSlots();

    if (this.overflow === 'auto' && this.opened) {
      this.disableOverflow();
    }
  }

  componentDidLoad(): void {
    this.windowElement = this.host.shadowRoot?.querySelector('.window') as HTMLElement;
    this.windowContentWrapper = this.host.shadowRoot?.querySelector(
      '.window-content-wrapper',
    ) as HTMLElement;
    this.updateWindowPaddings();
    if (this.windowElement != null) {
      this.addMobileEvents();
      this.windowElement.addEventListener('transitionend', this.handleWindowTransitionEnd);
    }
    this.updateCSSCustomProps();

    // The `opened` watcher does not fire for the initial value, so open the
    // native dialog here when the component mounts already open.
    if (this.opened) {
      this.showDialog();
      this.animateOpenWindow();
      this.openEvent.emit();
    }
  }

  componentDidUpdate(): void {
    // the header and the footer are hidden while their slots are empty: refresh
    // the paddings of the content once a late `top` or `bottom` child shows them
    this.updateWindowPaddings();
  }

  disconnectedCallback(): void {
    this.enableOverflow();
    clearTimeout(this.animationDelayTimeout);
    if (this.windowElement) {
      this.windowElement.removeEventListener('touchstart', this.setTouchStart);
      this.windowElement.removeEventListener('touchend', this.setTouchEnd);
      this.windowElement.removeEventListener('transitionend', this.handleWindowTransitionEnd);
    }
    this.enableOverflow();
  }

  private showDialog = (): void => {
    if (!this.dialogEl || this.dialogEl.open) {
      return;
    }
    // `showModal()` promotes the dialog to the top layer, traps focus and inerts
    // the page. `show()` keeps it non-modal so the page behind stays interactive,
    // preserving the legacy `hideBackdrop` click-through behaviour.
    if (!this.hideBackdrop) {
      this.dialogEl.showModal();
    } else {
      this.dialogEl.show();
    }
    // Measure here, not only in the lifecycle hooks: until this call the dialog is
    // `display: none`, so a header and a footer measure 0. A modal that mounts
    // already open never renders again on its own, so that 0 would stay and the
    // content would sit under both bars.
    this.updateWindowPaddings();
  };

  private closeDialog = (): void => {
    if (this.dialogEl?.open) {
      this.dialogEl.close();
    }
  };

  private handleBackdropClick = (e: Event): void => {
    if (this.interaction === 'strict') {
      return;
    }
    // A click whose target is the dialog itself (not its window contents) is a
    // click on the backdrop area.
    if (e.target === this.dialogEl) {
      this.opened = undefined;
    }
  };

  private handleCancel = (e: Event): void => {
    // Take over the native Esc dismissal so `strict` can veto it (and, later, so
    // the outro animation can play).
    e.preventDefault();
    if (this.interaction === 'strict') {
      return;
    }
    this.opened = undefined;
  };

  @Watch('opened')
  handleOpenProp(newValue: boolean, oldValue?: boolean): void {
    if (newValue) {
      if (this.overflow === 'auto') {
        this.disableOverflow();
      }
      this.showDialog();
      this.animateOpenWindow();
      this.openEvent.emit();
      return;
    }
    if (!oldValue) {
      return;
    }
    this.opened = undefined;
    this.closeDialog();
    if (this.overflow === 'auto') {
      this.enableOverflow();
    }
    this.animateCloseWindow();
    this.closeEvent.emit();
  }

  @Watch('hideBackdrop')
  handleHideBackdropProp(newValue?: boolean): void {
    if (newValue === false) {
      this.hideBackdrop = undefined;
    }
  }

  /**
   * Closes the modal.
   */
  @Method()
  async close(): Promise<void> {
    this.opened = undefined;
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <dialog
          aria-label={this.accessibleName}
          class="dialog"
          part="dialog"
          ref={(el?: HTMLElement) => (this.dialogEl = el as HTMLDialogElement)}
          onClick={(e: Event) => {
            this.handleBackdropClick(e);
          }}
          onCancel={(e: Event) => {
            this.handleCancel(e);
          }}
        >
          <slot name="window" onSlotchange={this.updateSlots} />
          {!this.hasWindow && (
            <div class="window" part="window">
              <div class={clsx('window-header', !this.hasTop && 'window-content--empty')}>
                <slot name="top" onSlotchange={this.updateSlots} />
              </div>
              <div class="window-content-wrapper">
                <div
                  class="window-content"
                  style={{
                    paddingTop: `${this.windowHeaderHeight}px`,
                    paddingBottom: `${this.windowFooterHeight}px`,
                  }}
                >
                  <slot />
                </div>
              </div>
              <div class={clsx('window-footer', !this.hasBottom && 'window-content--empty')}>
                <slot name="bottom" onSlotchange={this.updateSlots} />
              </div>
            </div>
          )}
          {!this.hasWindow && (
            <mds-button
              class="action-close"
              icon={miBaselineClose}
              variant="light"
              tone="text"
              size="xl"
              onClick={() => {
                this.opened = undefined;
              }}
              part="action-close"
            ></mds-button>
          )}
        </dialog>
      </Host>
    );
  }
}
