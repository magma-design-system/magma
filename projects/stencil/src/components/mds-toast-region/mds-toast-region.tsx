import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';
import { ToastPosition } from '@component/mds-toast/meta/types';

const DEFAULT_MAX = 3;

// a removed attribute leaves null, which counts as no duration, like 0
const hasDuration = (toast: HTMLMdsToastElement): boolean => {
  const duration = toast.duration ?? 0;
  return duration !== 0 && !Number.isNaN(duration);
};

/**
 * @slot - Add `mds-toast` elements, one per message: the region lines up the visible ones at its edge.
 */
@Component({
  tag: 'mds-toast-region',
  styleUrl: 'mds-toast-region.css',
  shadow: true,
})
export class MdsToastRegion {
  @Element() host: HTMLMdsToastRegionElement;
  private observer?: MutationObserver;
  // the visible toasts, oldest first: the order they were shown in, which is not the order of
  // the page when a toast is shown again
  private shown: HTMLMdsToastElement[] = [];

  /**
   * Sets the edge of the viewport where the toasts line up, and the `position` of every toast inside the region
   */
  @Prop({ reflect: true }) readonly position: ToastPosition = 'bottom-center';

  /**
   * The most toasts visible at once: when one more shows, the oldest one with a `duration` is hidden. A toast that stays (`duration="0"`) is never hidden by the region
   */
  @Prop({ reflect: true }) readonly max: number = DEFAULT_MAX;

  private limit = (): number =>
    Number.isInteger(this.max) && this.max > 0 ? this.max : DEFAULT_MAX;

  private toasts = (): HTMLMdsToastElement[] =>
    Array.from(this.host.querySelectorAll<HTMLMdsToastElement>('mds-toast'));

  /**
   * Gives the toasts the position of the region, follows the order they are shown in, and when
   * a toast shows while `max` are already visible, hides the oldest ones with a timer. The cap
   * acts only when a toast arrives, and never on the one arriving: a toast that stays until it
   * is closed is never hidden, so the region may hold more than `max` until one of them goes,
   * and a later look at the same toasts must not hide one of them after the fact.
   */
  private update = (): void => {
    const toasts = this.toasts();
    toasts.forEach((toast) => {
      if (toast.position !== this.position) {
        toast.position = this.position;
      }
    });
    const visible = toasts.filter((toast) => !!toast.visible);
    this.shown = this.shown.filter((toast) => visible.includes(toast));
    const arrived = visible.filter((toast) => !this.shown.includes(toast));
    this.shown.push(...arrived);
    if (arrived.length === 0) {
      return;
    }

    let over = this.shown.length - this.limit();
    for (const toast of this.shown.filter((shown) => !arrived.includes(shown))) {
      if (over <= 0) {
        break;
      }
      if (hasDuration(toast)) {
        toast.visible = false;
        over -= 1;
      }
    }
    this.shown = this.shown.filter((toast) => toast.visible);
  };

  private observe = (): void => {
    if (typeof MutationObserver === 'undefined') return;
    this.observer?.disconnect();
    this.observer = new MutationObserver(this.update);
    this.observer.observe(this.host, {
      attributeFilter: ['visible'],
      childList: true,
      subtree: true,
    });
  };

  connectedCallback(): void {
    this.observe();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private checkMax = (max: number): void => {
    if (max !== undefined && max !== null && !(Number.isInteger(max) && max > 0)) {
      console.warn(`mds-toast-region: ignoring the invalid max "${max}", using ${DEFAULT_MAX}`);
    }
  };

  componentWillLoad(): void {
    this.checkMax(this.max);
  }

  componentDidLoad(): void {
    this.update();
  }

  @Watch('position')
  positionChanged(): void {
    this.update();
  }

  @Watch('max')
  maxChanged(max: number): void {
    this.checkMax(max);
    this.update();
  }

  render() {
    // the live region, in the page before any message: a toast added or shown inside it is
    // announced. Not atomic, or every change would read out all the toasts again
    return (
      <Host role="status" aria-live="polite" aria-atomic="false">
        <slot />
      </Host>
    );
  }
}
