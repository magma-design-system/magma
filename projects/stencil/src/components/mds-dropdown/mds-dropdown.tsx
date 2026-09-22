import { KeyboardManager } from '@common/keyboard-manager';
import { cssDurationToMilliseconds } from '@common/unit';
import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui';
import arrowSvg from './assets/arrow.svg';
import { MdsDropdownEventDetail } from './meta/event-detail';
import { DropdownInteractionType } from './meta/types';
import { Backdrop, FloatingController, FloatingElement } from '@common/floating-controller';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot, elements will be shown when the component is triggered.
 */

@Component({
  tag: 'mds-dropdown',
  styleUrl: 'mds-dropdown.css',
  shadow: true,
})
export class MdsDropdown implements FloatingElement {
  private readonly km = new KeyboardManager();
  private cssMouseOverDelayDuration: string;
  private mouseoverTimer: NodeJS.Timeout;
  private caller: HTMLElement;
  private readonly backdropController: Backdrop = new Backdrop();
  private floatingController: FloatingController;

  @Element() readonly host!: HTMLMdsDropdownElement;

  /**
   * If set, the component will not have an arrow pointing to the caller.
   */
  @Prop({ reflect: true }) readonly hideArrow: boolean = false;

  /**
   * Sets the distance between arrow and dropdown margins.
   */
  @Prop() readonly arrowPadding: number = 24;

  /**
   * If set, the component will not be placed automatically near it's caller.
   */
  @Prop() readonly disableAutoPlacement: boolean = false;

  /**
   * Specifies if the component has a backdrop background
   */
  @Prop({ reflect: true }) backdrop?: boolean = false;

  /**
   * Specifies the placement of the component if no space is available where it is placed.
   */
  @Prop() readonly flip: boolean = false;

  /**
   * Specifies if the component is triggered from the caller on mouseover or click event
   */
  @Prop({ reflect: true }) readonly interaction: DropdownInteractionType = 'click';

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly target!: string;

  /**
   * Sets distance between the dropdown and the caller.
   */
  @Prop() readonly offset: number = 24;

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop() readonly placement: FloatingUIPlacement = 'bottom';

  /**
   * If set, the component will not be kept inside the viewport.
   */
  @Prop() readonly disableShift: boolean = false;

  /**
   * Sets a safe area distance between the dropdown and the viewport.
   */
  @Prop() readonly shiftPadding: number = 24;

  /**
   * If set, the component will not follow the caller smoothly when the page scrolls.
   */
  @Prop() readonly disableSmooth: boolean = false;

  /**
   * Sets the CSS position strategy of the component.
   */
  @Prop() readonly strategy: FloatingUIStrategy = 'absolute';

  /**
   * Specifies the visibility of the component.
   */
  @Prop({ mutable: true, reflect: true }) visible = false;

  /**
   * Specifies the visibility of the component.
   */
  @Prop() readonly zIndex: number;

  /**
   * Emits when a modal is visible
   */
  @Event({ eventName: 'mdsDropdownVisible' }) visibleEvent: EventEmitter<MdsDropdownEventDetail>;

  /**
   * Emits when a modal is hidden
   */
  @Event({ eventName: 'mdsDropdownHide' }) hiddenEvent: EventEmitter<MdsDropdownEventDetail>;

  /**
   * Emits when a modal is visible or hidden
   */
  @Event({ eventName: 'mdsDropdownChange' }) changedEvent: EventEmitter<MdsDropdownEventDetail>;

  @Watch('hideArrow')
  hideArrowChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('arrowPadding')
  arrowPaddingChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('disableAutoPlacement')
  disableAutoPlacementChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('backdrop')
  backdropChanged(newValue: boolean): void {
    if (newValue === false) {
      this.backdrop = undefined;
    }
    if (!this.visible) {
      return;
    }
    if (newValue) {
      this.backdropController.attachBackdrop();
      return;
    }
    this.backdropController.detachBackdrop();
  }

  @Watch('flip')
  flipChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('offset')
  offsetChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('placement')
  placementChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('disableShift')
  disableShiftChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('shiftPadding')
  shiftPaddingChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('strategy')
  strategyChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('target')
  targetChanged(): void {
    if (this.target === '' || this.floatingController == null) return;
    const caller = this.floatingController.updateCaller(this.target);
    if (!caller) return;
    if (this.caller && this.caller !== caller) this.unsetInteractionBehaviour(this.caller);
    this.caller = caller;
    // the role of the panel arrives with the caller, so the entries are named once it resolves
    this.markEntries();
    this.setInteractionBehaviour();
    this.km.addElement(this.host);
    this.km.attachEscapeBehavior(this.closeFromKeyboard);
  }

  @Watch('visible')
  visibleChanged(newValue: boolean): void {
    this.changedEvent.emit({ caller: this.caller, visible: newValue });
    this.floatingController.syncExpanded(newValue);
    if (newValue) {
      document.addEventListener('click', this.handleCloseDropdown);
      this.floatingController.updatePosition();
      if (this.backdrop) {
        this.backdropController.attachBackdrop();
      }
      this.visibleEvent.emit({ caller: this.caller, visible: true });
      return;
    }
    this.floatingController.dismiss();
    if (this.backdrop) {
      this.backdropController.detachBackdrop();
    }
    this.hiddenEvent.emit({ caller: this.caller, visible: false });
  }

  // the handlers of the caller are held as they are attached: `removeEventListener` answers to
  // the reference it was given, and a `.bind(this)` written at the call site makes a new one
  // every time, which is why nothing the caller was given was ever taken back
  private readonly onClickTarget = (ev: Event): void => {
    // stop propagation event for when target is a element cointainer
    ev.stopPropagation();
    // trigger a body click to execute handleCloseDropdown on other dropdowns
    document.body.click();
    this.visible = !this.visible;
    // a click with no coordinates behind it came from Enter on the caller, and a menu opened
    // from the keyboard has to land on an entry - a mouse leaves the focus where it is
    if (this.visible && this.isMenu && (ev as MouseEvent).detail === 0) {
      this.focusEntry(0);
    }
  };

  private readonly onMouseOverTarget = (): void => {
    this.mouseoverTimer = setTimeout(() => {
      clearTimeout(this.mouseoverTimer);
      this.visible = true;
    }, cssDurationToMilliseconds(this.cssMouseOverDelayDuration));
  };

  private readonly onMouseOutTarget = (): void => {
    clearTimeout(this.mouseoverTimer);
    this.mouseoverTimer = setTimeout(() => {
      clearTimeout(this.mouseoverTimer);
      this.visible = false;
    }, cssDurationToMilliseconds(this.cssMouseOverDelayDuration));
  };

  /**
   * The panel declares itself a `menu`, whose children axe only accepts as entries
   * (`aria-required-children`), so what the slot receives is what has to carry the role. And what
   * it receives can be a slot of its own, when the dropdown is rendered by a component that hands
   * over the slot of its own host - `mds-button-dropdown`, `mds-pref-language`. An `mds-button`
   * names itself a button as soon as it loads and which of the two loads first is not guaranteed,
   * so `button` is the role an entry overwrites, any other being a deliberate choice of the
   * consumer. A panel that declares another role holds no entries at all: its children are left
   * alone, a calendar being no menu item.
   */
  private readonly markEntries = (): void => {
    if (!this.isMenu) return;
    this.entries().forEach((entry) => {
      const role = entry.getAttribute('role');
      if (role === null || role === 'button') {
        entry.setAttribute('role', 'menuitem');
      }
      // an entry the arrows can reach has to be focusable, and an entry of a menu is reached
      // by the arrows and not by Tab, the menu being one stop of its own
      if (!entry.hasAttribute('tabindex')) {
        entry.setAttribute('tabindex', '-1');
      }
    });
  };

  private get isMenu(): boolean {
    return this.host.getAttribute('role') === 'menu';
  }

  private readonly entries = (): HTMLElement[] => {
    const slot = this.host.shadowRoot?.querySelector('slot');
    return this.slottedEntries(slot?.assignedElements() ?? []) as HTMLElement[];
  };

  private readonly slottedEntries = (elements: Element[]): Element[] =>
    elements.flatMap((element) =>
      element.tagName === 'SLOT'
        ? this.slottedEntries((element as HTMLSlotElement).assignedElements())
        : [element],
    );

  /**
   * Walks the entries the way the menu button pattern asks for: the arrows open the menu and
   * land on an entry, Home and End go to the ends, Escape gives the focus back and Tab lets it
   * leave from the caller. A panel that declares another role is none of this - the arrows of a
   * calendar or of a form belong to what the panel holds.
   */
  private readonly focusEntry = (index: number, attempts = 3): void => {
    const entries = this.entries();
    if (entries.length === 0 || !this.visible) return;
    const entry = entries[(index + entries.length) % entries.length];
    // the panel is display:none until `visible` reaches the render, and nothing hidden takes
    // the focus: the first frame after opening is the earliest the entry can have it
    if (entry.offsetWidth === 0 && attempts > 0) {
      requestAnimationFrame(() => this.focusEntry(index, attempts - 1));
      return;
    }
    entry.focus();
  };

  private readonly onCallerKeydown = (ev: KeyboardEvent): void => {
    if (!this.isMenu || (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp')) return;
    ev.preventDefault(); // the arrows would scroll the page under the menu
    this.visible = true;
    this.focusEntry(ev.key === 'ArrowUp' ? -1 : 0);
  };

  private readonly onPanelKeydown = (ev: KeyboardEvent): void => {
    if (!this.isMenu || !this.visible) return;
    const entries = this.entries();
    if (entries.length === 0) return;
    const focused = entries.findIndex((entry) => entry.contains(document.activeElement));
    const from = focused === -1 ? null : focused;

    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        this.focusEntry(from === null ? 0 : from + 1);
        break;
      case 'ArrowUp':
        ev.preventDefault();
        this.focusEntry(from === null ? -1 : from - 1);
        break;
      case 'Home':
        ev.preventDefault();
        this.focusEntry(0);
        break;
      case 'End':
        ev.preventDefault();
        this.focusEntry(-1);
        break;
      case 'Tab':
        // no preventDefault: the focus is handed to the caller and Tab carries on from there,
        // which is where it would have gone had the menu never opened
        this.visible = false;
        this.caller?.focus();
        break;
      default:
        break;
    }
  };

  /** Escape is heard on window, so it closes the panel wherever the focus is. Giving the focus
   * back is only right when the panel was holding it: a panel that goes display:none under the
   * focus drops it on the body, and the place in the page is lost */
  private readonly closeFromKeyboard = (): void => {
    if (!this.visible) return;
    const holdsFocus = this.host.contains(document.activeElement);
    this.visible = false;
    if (holdsFocus) this.caller?.focus();
  };

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.host);
    this.cssMouseOverDelayDuration = elementStyles.getPropertyValue(
      '--mds-dropdown-mouseover-delay',
    );
  };

  private readonly handleCloseDropdown = (e: Event): void => {
    if (e.type === 'mouseleave') {
      this.host.removeEventListener('mouseleave', this.handleCloseDropdown);
      this.caller.removeEventListener('mouseleave', this.handleCloseDropdown);
      this.visible = false;
      return;
    }
    if (!this.host.contains(e.target as HTMLElement) && (e.target as HTMLElement) !== this.caller) {
      this.visible = false;
      document.removeEventListener('click', this.handleCloseDropdown);
    }
  };

  private readonly setInteractionBehaviour = (): void => {
    if (this.interaction === 'none') {
      return;
    }

    if (this.interaction === 'click') {
      this.caller.addEventListener('click', this.onClickTarget);
      this.caller.addEventListener('keydown', this.onCallerKeydown);
    }

    if (this.interaction === 'mouseover') {
      this.caller.addEventListener('mouseover', this.onMouseOverTarget);
      this.caller.addEventListener('mouseout', this.onMouseOutTarget);
      this.host.addEventListener('mouseover', this.handleCloseDropdownMouseLeave);
    }
  };

  /** Hands the caller back what it was given: a caller the target no longer names would go on
   * opening a panel that is not its own */
  private readonly unsetInteractionBehaviour = (caller: HTMLElement): void => {
    caller.removeEventListener('click', this.onClickTarget);
    caller.removeEventListener('keydown', this.onCallerKeydown);
    caller.removeEventListener('mouseover', this.onMouseOverTarget);
    caller.removeEventListener('mouseout', this.onMouseOutTarget);
  };

  private readonly handleCloseDropdownMouseLeave = (): void => {
    clearTimeout(this.mouseoverTimer);
    this.host.removeEventListener('mouseover', this.handleCloseDropdownMouseLeave);
    this.host.addEventListener('mouseleave', this.handleCloseDropdown);
  };

  componentDidLoad(): void {
    const arrow = this.host.shadowRoot?.querySelector('.arrow') as HTMLElement;
    /**
     * When binding values in frameworks such as Angular
     * it is possible for the value to be set after the Web Component
     * initializes but before the value watcher is set up in Stencil.
     * As a result, the watcher callback may not be fired.
     * We work around this by manually calling the watcher
     * callback when the component has loaded and the watcher
     * is configured.
     */
    this.floatingController = new FloatingController(this.host, arrow);
    this.updateCSSCustomProps();
    this.targetChanged();
    this.host.shadowRoot?.querySelector('slot')?.addEventListener('slotchange', this.markEntries);
    // a nested slot lives in the tree of the host, where the slot of the shadow root, which is
    // the one the entries reach us through, never hears its slotchange
    this.host.addEventListener('slotchange', this.markEntries);
    // the entries are slotted children, so their keys reach the host by bubbling
    this.host.addEventListener('keydown', this.onPanelKeydown);

    // The watcher does not fire for the initial value, so a dropdown that mounts
    // with `visible` set was never positioned at all: no left, no top, no origin,
    // parked at the top left corner of the page.
    if (this.visible) {
      this.visibleChanged(true);
    }
  }

  disconnectedCallback(): void {
    this.floatingController.dismiss();
    this.backdropController.detachBackdrop();
    this.km.detachEscapeBehavior();
  }

  render() {
    return (
      <Host
        style={{
          zIndex: `${this.zIndex}`,
        }}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class="arrow" innerHTML={arrowSvg} />
        <slot />
      </Host>
    );
  }
}
