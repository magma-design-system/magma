import {
  arrow,
  autoPlacement,
  autoUpdate,
  computePosition,
  flip,
  Middleware,
  MiddlewareData,
  offset,
  Placement,
  shift,
} from '@floating-ui/dom';
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui';
import { cssDurationToMilliseconds } from './unit';
import { hashRandomValue, setAttributeIfEmpty } from './aria';
import { HTMLStencilElement } from '@stencil/core/internal';
import { Build } from '@stencil/core';

export interface FloatingElement extends PositionOptions {
  host: HTMLFloatingElement;
}

export interface HTMLFloatingElement extends HTMLStencilElement, PositionOptions {
  visible: boolean;
}

export interface PositionOptions {
  hideArrow: boolean;
  arrowPadding: number;
  disableAutoPlacement: boolean;
  flip: boolean;
  offset: number;
  placement: FloatingUIPlacement;
  disableShift: boolean;
  shiftPadding: number;
  strategy: FloatingUIStrategy;
}

/**
 * ARIA role the floating element takes when the markup does not name one: a `menu` is a popup its
 * caller controls, a `tooltip` only describes it. A panel that holds anything other than a list of
 * actions declares its own role and keeps it, `setAttributeIfEmpty` never overwriting it.
 */
export type FloatingRole = 'menu' | 'tooltip';

/** Roles of a popup that `aria-haspopup` knows how to name: a panel that calls itself a `group` has none */
const HASPOPUP_ROLES = ['dialog', 'grid', 'listbox', 'menu', 'tree'];

/**
 * A caller is wired only when it exposes a role that accepts the wiring: on a generic element
 * `aria-expanded` and `aria-haspopup` are attributes ARIA does not allow (axe `aria-allowed-attr`),
 * and a host that keeps its control inside its shadow root is generic exactly like a `div` - an
 * `mds-tab-item` renders the tab as its inner `mds-button[role="tab"]`, an `mds-chip` puts
 * `role="button"` on its label. Written on those hosts the attributes describe the wrapper and not
 * the control, and inside a tablist they even make the item a child the `tab` role no longer covers
 * (axe `aria-required-children`). Moving them onto the inner control is not an option either: an
 * IDREF does not cross the shadow boundary.
 */
const CALLER_ROLES = ['button', 'combobox', 'link', 'menuitem', 'tab', 'treeitem'];
const NATIVE_CALLERS = ['A', 'BUTTON', 'INPUT', 'SELECT', 'SUMMARY', 'TEXTAREA'];

export class FloatingController {
  private _caller: HTMLElement;
  private _wired = false;
  private readonly _host: HTMLFloatingElement;
  private readonly _role: FloatingRole;
  arrowEl: HTMLElement | undefined;

  private cleanupAutoUpdate: () => void;

  constructor(host: HTMLFloatingElement, arrowEl?: HTMLElement, role: FloatingRole = 'menu') {
    this._host = host;
    this.arrowEl = arrowEl;
    this._role = role;
  }

  updateCaller(target: string): HTMLElement | null {
    // search caller in document or rootNode of host (if target is in shadowDOM)
    const caller =
      (this._host.parentElement?.shadowRoot?.querySelector(target) as HTMLElement) ??
      ((this._host.getRootNode() as HTMLElement).querySelector(target) as HTMLElement);

    if (!caller) {
      // the target may legitimately be absent (e.g. during SSR the document
      // only contains the component subtree being serialized)
      console.warn(`FloatingController: target not found: ${target}`);
      return null;
    }

    this._caller = caller;
    this._wired = false;

    setAttributeIfEmpty(this._host, 'role', this._role);
    void this.wireCaller();
    return caller;
  }

  /** An IDREF does not cross a shadow boundary: a caller the host shares no tree with keeps the
   * attributes that need no reference and loses the ones that do */
  private readonly sameRoot = (): boolean =>
    this._caller.getRootNode() === this._host.getRootNode();

  private readonly callerAcceptsWiring = (): boolean => {
    const role = this._caller.getAttribute('role');
    return role !== null
      ? CALLER_ROLES.includes(role)
      : NATIVE_CALLERS.includes(this._caller.tagName);
  };

  /**
   * Ties caller and popup to each other with real IDREFs - the wiring used to write the selector
   * of the caller, which names no element at all, on both sides and towards the caller itself.
   * Our own callers are waited for first: an `mds-button` writes its `role="button"` in its own
   * `componentDidLoad`, and which of the two components loads first is not guaranteed.
   */
  private readonly wireCaller = async (): Promise<void> => {
    const caller = this._caller;
    // the hydrate app has no registry to wait on (its `customElements` is null) and renders
    // every component in one pass, so there the attributes are written on the spot - and kept
    // by the client, `setAttributeIfEmpty` leaving a prerendered value alone
    if (Build.isBrowser && caller.tagName.startsWith('MDS-')) {
      await customElements.whenDefined(caller.tagName.toLowerCase());
      await (caller as Partial<HTMLStencilElement>).componentOnReady?.();
    }
    // a target change while we waited has already wired another caller
    if (caller !== this._caller) return;

    // a tooltip is not a popup its caller controls, and nothing it opens is named on it
    if (this._role === 'tooltip') return;

    if (!this.callerAcceptsWiring()) return;

    if (this.sameRoot()) {
      const hostId = setAttributeIfEmpty(this._host, 'id', hashRandomValue('mds-dropdown'));
      const callerId = setAttributeIfEmpty(caller, 'id', hashRandomValue('mds-dropdown-caller'));
      setAttributeIfEmpty(caller, 'aria-controls', hostId);
      setAttributeIfEmpty(this._host, 'aria-labelledby', callerId);
    }

    const popupRole = this._host.getAttribute('role') ?? '';
    if (HASPOPUP_ROLES.includes(popupRole)) {
      setAttributeIfEmpty(caller, 'aria-haspopup', popupRole);
    }

    this._wired = true;
    this.syncExpanded(this._host.visible);
  };

  /** Whether the popup is open is state, not a default: it is rewritten at every change, so it
   * cannot go through `setAttributeIfEmpty` */
  syncExpanded(visible: boolean): void {
    if (this._wired) this._caller.setAttribute('aria-expanded', `${visible}`);
  }

  private readonly arrowInset = (
    middleware: MiddlewareData,
    arrowPosition: string,
  ): { bottom?: string; left?: string; right?: string; top?: string } => {
    const { arrow } = middleware;
    const inset = { bottom: '', left: '', right: '', top: '' };

    if (arrow === undefined) {
      return {};
    }

    switch (arrowPosition) {
      case 'bottom':
        inset.left = arrow.x !== null ? `${arrow.x}px` : '';
        inset.top = '100%';
        break;
      case 'left':
        inset.right = '100%';
        inset.top = arrow.y !== null ? `${arrow.y}px` : '';
        break;
      case 'right':
        inset.left = '100%';
        inset.top = arrow.y !== null ? `${arrow.y}px` : '';
        break;
      case 'top':
        inset.left = arrow.x !== null ? `${arrow.x}px` : '';
        inset.top = '';
        break;
      default:
        break;
    }
    return inset;
  };

  private readonly arrowTransform = (arrowPosition: string): { transform: string } => {
    let transformProps = !this._host.hideArrow && this._host.visible ? 'scale(1)' : 'scale(0)';
    switch (arrowPosition) {
      case 'bottom':
        transformProps = `rotate(180deg) ${transformProps} translate(0, -100%)`;
        break;
      case 'left':
        transformProps = `rotate(-90deg) ${transformProps} translate(50%, -50%)`;
        break;
      case 'right':
        transformProps = `rotate(90deg) ${transformProps} translate(-50%, -50%)`;
        break;
      case 'top':
        transformProps = `rotate(0deg) ${transformProps} translate(0, 0)`;
        break;
      default:
        break;
    }
    return { transform: transformProps };
  };

  private readonly arrowTransformOrigin = (arrowPosition: string): { transformOrigin: string } => {
    switch (arrowPosition) {
      case 'bottom':
        return { transformOrigin: 'center top' };
      case 'left':
        return { transformOrigin: 'right center' };
      case 'right':
        return { transformOrigin: 'left center' };
      case 'top':
        return { transformOrigin: 'center bottom' };
      default:
        return { transformOrigin: 'center top' };
    }
  };

  /**
   * The pivot of the opening animation is the arrow, which the `arrow` middleware
   * parks wherever it has to sit to keep pointing at the caller: after a shift it
   * is nowhere near the centre of the panel. `convertToTransformOrigin` only knows
   * the placement, so it answers `center top` for every bottom placement and the
   * panel grows from a point that has nothing to do with the arrow - measured on a
   * 408px panel pushed against the left edge, the two were 165px apart.
   */
  private readonly arrowOrigin = (
    placement: Placement,
    middleware: MiddlewareData,
  ): string | null => {
    const { arrow: arrowData } = middleware;
    if (!this.arrowEl || this._host.hideArrow || arrowData === undefined) {
      return null;
    }
    const side = placement.split('-')[0];
    if (arrowData.x !== null && arrowData.x !== undefined) {
      const x = arrowData.x + this.arrowEl.offsetWidth / 2;
      if (side === 'bottom') return `${x}px top`;
      if (side === 'top') return `${x}px bottom`;
    }
    if (arrowData.y !== null && arrowData.y !== undefined) {
      const y = arrowData.y + this.arrowEl.offsetHeight / 2;
      if (side === 'right') return `left ${y}px`;
      if (side === 'left') return `right ${y}px`;
    }
    return null;
  };

  private convertToTransformOrigin = (position: Placement): string => {
    const positions = {
      top: 'center bottom',
      right: 'left center',
      bottom: 'center top',
      left: 'right center',
      'bottom-end': 'top right',
      'bottom-start': 'top left',
      'left-end': 'right bottom',
      'left-start': 'right top',
      'right-end': 'left bottom',
      'right-start': 'left top',
      'top-end': 'bottom right',
      'top-start': 'bottom left',
    };
    return positions[position];
  };

  private readonly calculatePosition = (): void => {
    if (!this._caller) return;

    const middleware: Middleware[] = new Array<Middleware>();
    const config: { padding?: number } = {};

    if (this._host.shiftPadding) {
      config.padding = this._host.shiftPadding;
    }

    if (!this._host.disableAutoPlacement) {
      middleware.push(autoPlacement());
    }

    if (this._host.offset) {
      middleware.push(offset(this._host.offset));
    }

    if (this._host.disableAutoPlacement && this._host.flip) {
      middleware.push(flip(config));
    }

    if (!this._host.disableShift) {
      middleware.push(shift(config));
    }

    if (this.arrowEl && !this._host.hideArrow) {
      middleware.push(
        arrow({
          element: this.arrowEl,
          padding: this._host.arrowPadding,
        }),
      );
    }

    computePosition(this._caller, this._host, {
      middleware,
      placement: this._host.placement,
      strategy: this._host.strategy,
    }).then(({ x, y, placement, middlewareData }) => {
      // The first placement must land instantly: until it happens the panel has no
      // position at all, so animating left/top towards the caller would fly it in
      // from the corner of the page. The mark goes on a frame LATER, because a
      // value and the attribute that makes it transition, written in the same
      // recalc, still animate - the frame in between is what makes the first
      // placement a jump and every move after it a glide.
      const firstPlacement = !this._host.hasAttribute('data-floating-placed');

      Object.assign(this._host.style, {
        left: `${x}px`,
        top: `${y}px`,
        transformOrigin:
          this.arrowOrigin(placement, middlewareData) ?? this.convertToTransformOrigin(placement),
        position: this._host.strategy,
      });

      if (firstPlacement) {
        requestAnimationFrame(() => this._host.setAttribute('data-floating-placed', ''));
      }

      const arrowStyle = {};
      const arrowPosition = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      if (arrowPosition && this.arrowEl) {
        Object.assign(arrowStyle, this.arrowTransform(arrowPosition));
        Object.assign(arrowStyle, this.arrowInset(middlewareData, arrowPosition));
        Object.assign(arrowStyle, this.arrowTransformOrigin(arrowPosition));
        Object.assign(this.arrowEl.style, arrowStyle);
      }
    });
  };

  /**
   * Starts positioning only once the panel has a box to measure. A closed panel is
   * `display: none`, and Stencil reflects `visible` on its own render, so the tick
   * that asks for the position still sees a panel of zero width: floating-ui then
   * places a box that does not exist. On a `bottom` placement that lands it half a
   * panel off; on `left` or `right` it lands it a whole panel off, which reads as
   * the panel opening on the wrong side of the caller and sliding across to its
   * place, because the correction that follows is transitioned like any other
   * move.
   */
  private readonly startWhenMeasurable = (attempts: number): void => {
    if (!this._host.visible) return;
    if (this._host.offsetWidth === 0 && attempts > 0) {
      requestAnimationFrame(() => this.startWhenMeasurable(attempts - 1));
      return;
    }
    this.cleanupAutoUpdate = autoUpdate(this._caller, this._host, this.calculatePosition);
  };

  updatePosition(): void {
    if (this._host.visible) {
      this.dismiss(); // to clean the old update function before update function
      this.startWhenMeasurable(3);
    }
  }

  dismiss(): void {
    if (this.cleanupAutoUpdate) this.cleanupAutoUpdate();
  }
}

export class Backdrop {
  private readonly defaultBackdropId = 'magma-backdrop';
  private readonly backdropBackgroundVisible =
    'rgba(var(--magma-backdrop-color, 0 0 0) / var(--magma-backdrop-opacity, 0.1))';
  private readonly backdropBackgroundHidden = 'rgba(var(--magma-backdrop-color, 0 0 0) / 0)';

  private readonly backdropId: string;
  private readonly cssBackdropZIndex: string;
  private readonly cssBackdropDuration: string;

  private backdropEl: HTMLElement;
  private backdropTimer: NodeJS.Timeout;

  constructor(backdropId?: string) {
    this.backdropId = backdropId ?? this.defaultBackdropId;
    this.cssBackdropZIndex = `var(--${this.backdropId}-z-index, 4000)`;
    this.cssBackdropDuration = `var(--${this.backdropId}-animation-duration, 300ms)`;
  }

  attachBackdrop(): void {
    if (!this.backdropEl) {
      this.backdropEl = document.createElement('div');
      this.backdropEl.className = this.backdropId;
      this.backdropEl.style.inset = '0';
      this.backdropEl.style.pointerEvents = 'none';
      this.backdropEl.style.position = 'fixed';
      this.backdropEl.style.transition = `background-color ${this.cssBackdropDuration} ease-out`;
      this.backdropEl.style.zIndex = this.cssBackdropZIndex;
    }
    this.backdropEl.style.backgroundColor = this.backdropBackgroundHidden;
    document.body.appendChild(this.backdropEl);

    clearTimeout(this.backdropTimer);
    this.backdropTimer = setTimeout(() => {
      this.backdropEl.style.backgroundColor = this.backdropBackgroundVisible;
    }, 1);
  }

  detachBackdrop(): void {
    if (!this.backdropEl) {
      return;
    }
    this.backdropEl.style.backgroundColor = 'transparent';
    clearTimeout(this.backdropTimer);
    this.backdropTimer = setTimeout(() => {
      this.backdropEl.remove();
    }, cssDurationToMilliseconds(this.cssBackdropDuration));
  }
}
