import { Component, Element, Host, h, Prop, State, Watch } from '@stencil/core';
import { preferenceStore } from '@common/preference';
import { addIdRef, hashRandomValue, removeIdRef, setAttributeIfEmpty } from '@common/aria';
import { autoUpdate, computePosition, Middleware, offset, shift } from '@floating-ui/dom';
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui';
import { StrategyType } from './meta/types';

@Component({
  tag: 'mds-notification',
  styleUrl: 'mds-notification.css',
  shadow: true,
})
export class MdsNotification {
  private caller: HTMLElement;
  private describedCaller?: HTMLElement;
  @State() private describing = false;
  @Element() private host: HTMLMdsNotificationElement;
  private cleanupAutoUpdate?: () => void;
  private autoUpdateTimer?: ReturnType<typeof setTimeout>;

  // We should change in the future this approach when it will be fully supported by main browsers
  // https://www.youtube.com/watch?v=DNXEORSk4GU&list=PLMTbm2xm6FfPWPUr__bFUGVPfYMZwu5U7&index=67

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly target: string;

  /**
   * Specifies the number of notifications to display. At 0 the badge shows no number, as an
   * empty dot: it is not hidden, `dismissed` takes it off its target
   */
  @Prop({ mutable: true, reflect: true }) value = 0;

  /**
   * Specifies if the notification is dismissed
   */
  @Prop({ mutable: true, reflect: true }) dismissed = false;

  /**
   * Specifies the position strategy of the notification
   */
  @Prop({ mutable: true, reflect: true }) strategy: StrategyType = 'fixed';

  /**
   * Specifies the maximum number that can be seen, assuming that the number is for example 9 and that this is exceeded with 15, the component shows +9
   */
  @Prop({ reflect: true }) max?: number;

  private placement?: FloatingUIPlacement = 'right-start';

  private updatePosition = (): void => {
    const middleware = new Array<Middleware>();
    const strategySelected: FloatingUIStrategy =
      this.strategy === 'disabled' ? 'absolute' : 'fixed';

    middleware.push(offset(0));
    middleware.push(shift({ padding: 0 }));

    computePosition(this.caller, this.host, {
      middleware,
      placement: this.placement,
      strategy: strategySelected,
    }).then(({ x, y }) => {
      Object.assign(this.host.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  };

  private clean = (value: number): string => {
    // a removed attribute leaves null, which counts as no value and no maximum
    if ((value ?? 0) === 0 || isNaN(value)) return '';
    const max = this.max ?? 0;
    if (max !== 0 && !Number.isNaN(max) && value > max) {
      return `+${Number(max).toLocaleString()}`;
    }

    return Number(value).toLocaleString();
  };

  componentDidRender(): void {
    if ((this.target ?? '') === '') {
      this.strategy = 'disabled';
      return;
    }
    const c = document.querySelector(this.target) as HTMLElement;
    if (c == null) {
      // the target may legitimately be absent (e.g. during SSR the document
      // only contains the component subtree being serialized)
      console.warn(`mds-notification: no valid target found: ${this.target}`);
      this.strategy = 'disabled';
      return;
    }
    this.caller = c;
    this.describeCaller(c);
  }

  /**
   * The count reaches a screen reader through the element it sits on, as a description of it
   * ("Messages, button, 3"): the badge itself is then hidden, or it would be read again wherever
   * it sits in the page. A dismissed badge, a plain dot and a caller in another tree (an IDREF
   * does not cross a shadow boundary) describe nothing. Ids already in the caller's
   * `aria-describedby`, a tooltip's among them, stay. Without a target the count is plain text,
   * read with whatever contains it: the name of the mds-button it sits in.
   */
  private describeCaller = (caller?: HTMLElement): void => {
    const id = this.host.id;
    if (this.describedCaller && this.describedCaller !== caller && id) {
      removeIdRef(this.describedCaller, 'aria-describedby', id);
    }
    const describes =
      caller !== undefined &&
      !this.dismissed &&
      this.clean(this.value) !== '' &&
      caller.getRootNode() === this.host.getRootNode();
    // the state is set once, to its final value: a render runs after every change of it, and
    // this runs after every render
    this.describing = describes;
    if (!describes) {
      if (caller && id) removeIdRef(caller, 'aria-describedby', id);
      this.describedCaller = undefined;
      return;
    }
    const badgeId = setAttributeIfEmpty(this.host, 'id', hashRandomValue('mds-notification'));
    addIdRef(caller, 'aria-describedby', badgeId);
    this.describedCaller = caller;
  };

  componentDidLoad(): void {
    if (this.strategy === 'disabled') {
      return;
    }

    this.startAutoUpdate();
  }

  /**
   * floating-ui keeps the badge on its target through listeners on the scroll parents and an
   * observer of their size: they are started once, after a short wait for the target's layout,
   * and stopped with the function autoUpdate returns. That function used to be replaced by an
   * empty one instead of being called, so every badge ever removed kept its listeners.
   */
  private startAutoUpdate = (): void => {
    if (this.strategy === 'disabled' || (this.target ?? '') === '' || !this.caller) return;
    if (this.cleanupAutoUpdate || this.autoUpdateTimer !== undefined) return;
    this.autoUpdateTimer = setTimeout(() => {
      this.autoUpdateTimer = undefined;
      this.cleanupAutoUpdate = autoUpdate(this.caller, this.host, this.updatePosition);
    }, 100);
  };

  private stopAutoUpdate = (): void => {
    clearTimeout(this.autoUpdateTimer);
    this.autoUpdateTimer = undefined;
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = undefined;
  };

  // a badge moved in the page is disconnected and connected again, without loading again
  connectedCallback(): void {
    this.startAutoUpdate();
  }

  disconnectedCallback(): void {
    this.stopAutoUpdate();
    this.describeCaller(undefined);
  }

  @Watch('strategy')
  strategyHandler(newValue: StrategyType): void {
    if (newValue === 'disabled') {
      this.stopAutoUpdate();
    }
  }

  render() {
    return (
      <Host
        aria-hidden={this.describing ? 'true' : undefined}
        pref-animation={preferenceStore.state.animation}
      >
        <mds-text typography="caption" class="dot">
          {this.clean(this.value)}
        </mds-text>
      </Host>
    );
  }
}
