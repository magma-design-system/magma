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
  Watch,
} from '@stencil/core';
import {
  ModalPositionType,
  ModalAnimationStateType,
  ModalOverflowType,
  ModalAnimationStyleType,
  ModalInteractionType,
} from './meta/types';
import { cssDurationToMilliseconds } from '@common/unit';
import miBaselineClose from '@icon/mi/baseline/close.svg';

/**
 * @part action-close - Selects the close button of the modal.
 * @part window - Selects the default window element of the modal when used.
 * @slot bottom - Contents that will be placed on bottom of the window. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot default - Contents that will be placed in the center of the window. Add `text string`, `HTML elements` or `components` to this slot.
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
  private window = false;
  private top = false;
  private bodyOverflow: string;
  private bottom = false;
  private cssTransitionDuration: string = '500';
  private windowElement: HTMLElement;
  private windowHeaderElement: HTMLElement;
  private windowFooterElement: HTMLElement;
  private windowHeaderHeight: number;
  private windowFooterHeight: number;
  private touchStartX: number;
  private touchStartY: number;
  private touchMargin: number = 50;

  @Element() host: HTMLMdsModalElement;

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true, mutable: true }) opened?: boolean = false;

  /**
   * Specifies if the modal shows the backdrop
   */
  @Prop({ reflect: true, mutable: true }) backdrop?: boolean = true;

  /**
   * Specifies the animation position of the modal window
   */
  @Prop({ reflect: true, mutable: true }) position?: ModalPositionType = 'center';

  /**
   * Specifies if the component is animating itself or not
   */
  @Prop({ reflect: true, mutable: true }) animating?: ModalAnimationStateType = 'none';

  /**
   * Specifies if the component is animating itself or not
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
    this.animating = 'none';
    this.host.setAttribute('animating', 'none'); // wtf?
    this.showEvent.emit();
    clearTimeout(this.animationDelayTimeout);
  };

  private stopOutroAnimationWindow = (): void => {
    this.animating = 'none';
    this.host.setAttribute('animating', 'none');
    this.hideEvent.emit();
    clearTimeout(this.animationDelayTimeout);
  };

  private disableOverflow = (): void => {
    if (document) {
      if (document.body.style.overflow) {
        this.bodyOverflow = document.body.style.overflow;
      }
      document.body.style.overflow = 'hidden';
    }
  };

  private enableOverflow = (): void => {
    if (document) {
      if (this.bodyOverflow) {
        document.body.style.overflow = this.bodyOverflow;
      } else {
        document.body.style.removeProperty('overflow');
      }
    }
  };

  private animateOpenWindow = (): void => {
    this.animating = 'intro';
    clearTimeout(this.animationDelayTimeout);
    this.animationDelayTimeout = setTimeout(
      this.stopIntroAnimationWindow.bind(this),
      cssDurationToMilliseconds(this.cssTransitionDuration),
    );
  };

  private animateCloseWindow = (): void => {
    this.animating = 'outro';
    clearTimeout(this.animationDelayTimeout);
    this.animationDelayTimeout = setTimeout(
      this.stopOutroAnimationWindow.bind(this),
      cssDurationToMilliseconds(this.cssTransitionDuration),
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

  componentWillLoad(): void {
    this.bottom = this.host.querySelector(':scope > [slot="bottom"]') !== null;
    this.top = this.host.querySelector(':scope > [slot="top"]') !== null;
    this.window = this.host.querySelector(':scope > [slot="window"]') !== null;

    if (this.overflow === 'auto' && this.opened) {
      this.disableOverflow();
    }

    if (this.window) {
      this.host.querySelector(':scope > [slot="window"]')?.setAttribute('role', 'dialog');
    }
  }

  componentWillRender(): void {
    this.animating = this.opened ? 'intro' : 'outro';
  }

  componentDidLoad(): void {
    this.windowElement = this.host.shadowRoot?.querySelector('.window') as HTMLElement;
    this.windowHeaderElement = this.host.shadowRoot?.querySelector('.window-header') as HTMLElement;
    this.windowFooterElement = this.host.shadowRoot?.querySelector('.window-footer') as HTMLElement;

    if (this.windowHeaderElement) {
      this.windowHeaderHeight = this.windowHeaderElement.offsetHeight;
    }
    if (this.windowFooterElement) {
      this.windowFooterHeight = this.windowFooterElement.offsetHeight;
    }
    if (this.windowElement) {
      this.addMobileEvents();
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

  disconnectedCallback(): void {
    this.enableOverflow();
    if (this.windowElement) {
      this.windowElement.removeEventListener('touchstart', this.setTouchStart);
      this.windowElement.removeEventListener('touchend', this.setTouchEnd);
    }
    this.enableOverflow();
  }

  private showDialog = (): void => {
    if (!this.dialogEl || this.dialogEl.open) {
      return;
    }
    // `showModal()` promotes the dialog to the top layer, traps focus and inerts
    // the page. `show()` keeps it non-modal so the page behind stays interactive,
    // preserving the legacy `backdrop=false` click-through behaviour.
    if (this.backdrop) {
      this.dialogEl.showModal();
    } else {
      this.dialogEl.show();
    }
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

  @Watch('backdrop')
  handleBackdropProp(newValue?: boolean): void {
    if (newValue === false) {
      this.backdrop = undefined;
    }
  }

  @Method()
  async close(): Promise<void> {
    this.opened = undefined;
  }

  render() {
    return (
      <Host>
        <dialog
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
          {this.window ? (
            <slot name="window" />
          ) : (
            <div class="window" part="window">
              <div class={clsx('window-header', this.top ? '' : 'window-content--empty')}>
                <slot name="top" />
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
              <div class={clsx('window-footer', this.bottom ? '' : 'window-content--empty')}>
                <slot name="bottom" />
              </div>
            </div>
          )}
          {!this.window && (
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
