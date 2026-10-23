import { Component, Host, Prop, Element, h, Watch } from '@stencil/core';
import { queryChildrenBySlot } from '@common/slot';
import { ButtonSizeType, ButtonVariantType } from '@type/button';
import { Direction, Interaction } from './meta/types';
import miBaselineMoreVert from '@icon/mi/baseline/more-vert.svg';
import miBaselineClose from '@icon/mi/baseline/close.svg';
import clsx from 'clsx';
import { ToneVariantType } from '@type/tone';

import { Backdrop } from '@common/floating-controller';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot item - Add `mds-radial-menu-item` elements or `components` to this slot.
 * @part radial-menu - The ring that lays out the `item` slot around the trigger
 * @category actions
 */
@Component({
  tag: 'mds-radial-menu',
  styleUrl: 'mds-radial-menu.css',
  shadow: true,
})
export class MdsRadialMenu {
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @Element() private hostElement: HTMLMdsRadialMenuElement;
  private readonly backdropController: Backdrop = new Backdrop('mds-radial-menu-backdrop');

  /**
   * Specifies the starting angle of the menu, in degrees; when it is not set the menu takes
   * `--mds-radial-menu-angle-start`, `0deg` by default
   */
  @Prop({ reflect: true }) readonly angleStart: number;

  /**
   * Specifies the ending angle of the menu, in degrees; when it is not set the menu takes
   * `--mds-radial-menu-angle-end`, `360deg` by default
   */
  @Prop({ reflect: true }) readonly angleEnd: number;

  /**
   * Specifies the radius of the menu, in `rem`; when it is not set the menu takes
   * `--mds-radial-menu-radius`, `5rem` by default
   */
  @Prop({ reflect: true }) readonly radius: number;

  /**
   * Specifies the direction of the menu elements
   */
  @Prop({ reflect: true }) readonly direction: Direction = 'clockwise';

  /**
   * Specifies if the menu is opened or not
   */
  @Prop({ mutable: true, reflect: true }) opened?: boolean;

  /**
   * Specifies if the menu has a disc beneath or not
   */
  @Prop({ mutable: true, reflect: true }) disc?: boolean;

  /**
   * Specifies if the component has a backdrop background
   */
  @Prop({ reflect: true }) backdrop?: boolean = false;

  /**
   * Specifies how to open the menu
   */
  @Prop({ reflect: true }) readonly interaction: Interaction = 'click';

  /**
   * The icon displayed in the button
   */
  @Prop({ reflect: true, mutable: true }) icon?: string;

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonVariantType = 'dark';

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'strong';

  /**
   * Specifies the size for the button
   */
  @Prop({ reflect: true }) readonly size: ButtonSizeType = 'lg';

  private items: HTMLMdsRadialMenuItemElement[];

  private toggleMenu = (): void => {
    if (this.opened === true) {
      this.opened = undefined;
      return;
    }
    this.opened = true;
  };

  private setItemSize = (): void => {
    this.items?.forEach((item: HTMLMdsRadialMenuItemElement) => {
      item.size = this.size;
    });
  };

  private setItemIndex = (): void => {
    this.items.forEach((item: HTMLMdsRadialMenuItemElement, index: number) => {
      item.style.setProperty('--mds-radial-menu-item-index', index.toString());
    });
  };

  // a geometry prop writes its custom property inline only while it is set: without it the menu
  // takes the value a stylesheet gives the property, or the default of the component
  private writeGeometry = (name: string, value: number | undefined, unit: string): void => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      this.hostElement.style.removeProperty(name);
      return;
    }
    this.hostElement.style.setProperty(name, `${value}${unit}`);
  };

  private updateItems = (): void => {
    this.items = queryChildrenBySlot(this.hostElement, 'item') as HTMLMdsRadialMenuItemElement[];
    this.setItemSize();
    this.setItemIndex();
    this.hostElement.style.setProperty(
      '--mds-radial-menu-nth-siblings',
      (this.items.length - 1).toString(),
    );
  };

  componentWillLoad(): void {
    this.icon = this.icon ?? miBaselineMoreVert;
    this.onAngleStartChange(this.angleStart);
    this.onAngleEndChange(this.angleEnd);
    this.onRadiusChange(this.radius);
    this.onSizeChange();
  }

  componentDidLoad(): void {
    this.updateItems();
    this.onOpenedChange(this.opened);
    this.onInteractionChange(this.interaction);
  }

  disconnectedCallback(): void {
    if (typeof document === 'undefined') return;
    document.removeEventListener('contextmenu', this.toggleRightClickMenu);
    this.listenOutside(false);
  }

  // a click outside the menu and Escape close the open menu: the backdrop takes no pointer, so
  // nothing else did. Escape gives the focus back to the trigger when it was inside the menu
  private handleOutsideClick = (event: MouseEvent): void => {
    if (event.composedPath().includes(this.hostElement)) return;
    this.opened = undefined;
  };

  private handleEscape = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    const hadFocus = this.hostElement.matches(':focus-within');
    this.opened = undefined;
    if (hadFocus && this.interaction === 'click') {
      this.hostElement.shadowRoot?.querySelector<HTMLElement>('.menu-button')?.focus();
    }
  };

  private listenOutside = (listen: boolean): void => {
    if (typeof document === 'undefined') return;
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscape);
    if (!listen) return;
    document.addEventListener('click', this.handleOutsideClick);
    document.addEventListener('keydown', this.handleEscape);
  };

  private toggleRightClickMenu = (e: MouseEvent): void => {
    e.preventDefault();
    this.hostElement.style.top = `${e.clientY - this.hostElement.offsetHeight / 2}px`;
    this.hostElement.style.left = `${e.clientX - this.hostElement.offsetWidth / 2}px`;
    this.toggleMenu();
  };

  private handleBackdrop = (): void => {
    if (!this.backdrop) {
      this.backdropController.detachBackdrop();
      return;
    }
    if (this.opened) {
      this.backdropController.attachBackdrop();
      return;
    }
    this.backdropController.detachBackdrop();
  };

  @Watch('disc')
  onDiscChanged(newValue?: boolean): void {
    if (newValue === false) {
      this.disc = undefined;
    }
  }

  @Watch('backdrop')
  backdropChanged(newValue: boolean): void {
    if (newValue === false) {
      this.backdrop = undefined;
    }
    this.handleBackdrop();
  }

  @Watch('interaction')
  onInteractionChange(newValue?: Interaction): void {
    if (typeof document === 'undefined') return;
    if (newValue === 'rightclick') {
      document.addEventListener('contextmenu', this.toggleRightClickMenu);
      return;
    }
    document.removeEventListener('contextmenu', this.toggleRightClickMenu);
  }

  @Watch('angleStart')
  onAngleStartChange(newValue?: number): void {
    this.writeGeometry('--mds-radial-menu-angle-start', newValue, 'deg');
  }

  @Watch('angleEnd')
  onAngleEndChange(newValue?: number): void {
    this.writeGeometry('--mds-radial-menu-angle-end', newValue, 'deg');
  }

  @Watch('radius')
  onRadiusChange(newValue?: number): void {
    this.writeGeometry('--mds-radial-menu-radius', newValue, 'rem');
  }

  @Watch('size')
  onSizeChange(): void {
    this.setItemSize();
  }

  @Watch('opened')
  onOpenedChange(newValue?: boolean): void {
    if (newValue === false) {
      this.opened = undefined;
    }
    this.handleBackdrop();
    this.listenOutside(!!newValue);
  }

  render() {
    return (
      <Host>
        <mds-button
          aria-label={this.t.get(this.opened ? 'closeMenu' : 'openMenu')}
          class={clsx('menu-button', this.interaction !== 'click' && 'menu-button--hidden')}
          icon={this.opened ? miBaselineClose : this.icon}
          tone={this.tone}
          variant={this.variant}
          size={this.size}
          onClick={this.toggleMenu}
        ></mds-button>
        <div class="radial-menu" part="radial-menu">
          <slot name="item" onSlotchange={this.updateItems}></slot>
        </div>
        <div class="disc"></div>
      </Host>
    );
  }
}
