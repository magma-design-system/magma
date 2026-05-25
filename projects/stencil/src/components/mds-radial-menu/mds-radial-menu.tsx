import { Component, Host, Prop, Element, h, Watch } from '@stencil/core';
import { ButtonSizeType, ButtonVariantType } from '@type/button';
import { Direction, Interaction } from './meta/types';
import miBaselineMoreVert from '@icon/mi/baseline/more-vert.svg';
import miBaselineClose from '@icon/mi/baseline/close.svg';
import clsx from 'clsx';
import { ToneVariantType } from '@type/tone';

import { Backdrop } from '@common/floating-controller';

@Component({
  tag: 'mds-radial-menu',
  styleUrl: 'mds-radial-menu.css',
  shadow: true,
})
export class MdsRadialMenu {
  @Element() private hostElement: HTMLMdsCardHeaderElement;
  private readonly backdropController: Backdrop = new Backdrop('mds-radial-menu-backdrop');

  /**
   * Specifies the starting angle of the menu
   */
  @Prop({ reflect: true }) readonly angleStart: number = 0;

  /**
   * Specifies the ending angle of the menu
   */
  @Prop({ reflect: true }) readonly angleEnd: number = 360;

  /**
   * Specifies the radius of the menu
   */
  @Prop({ reflect: true }) readonly radius: number = 5;

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

  private items: NodeListOf<HTMLMdsRadialMenuItemElement>;

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

  private setIsFullCircle = (): void => {
    const isFullCircle = this.angleEnd - this.angleStart === 360 ? '1' : '0';
    this.hostElement.style.setProperty('--mds-radial-menu-is-full-circle', isFullCircle);
  };

  private setIsStartGreaterThanEnd = (): void => {
    if (this.angleStart > this.angleEnd) {
      this.hostElement.style.setProperty('--mds-radial-menu-is-start-greater-than-end', '-1');
      return;
    }

    this.hostElement.style.setProperty('--mds-radial-menu-is-start-greater-than-end', '1');
  };

  private updateItems = (): void => {
    this.items = this.hostElement.querySelectorAll(':scope > [slot="item"]');
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
    this.setIsFullCircle();
    this.setIsStartGreaterThanEnd();
    this.onOpenedChange(this.opened);
    this.onInteractionChange(this.interaction);
  }

  disconnectedCallback(): void {
    if (!document) return;
    document.removeEventListener('contextmenu', this.toggleRightClickMenu);
  }

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
    if (!document) return;
    if (newValue === 'rightclick') {
      document.addEventListener('contextmenu', this.toggleRightClickMenu);
      return;
    }
    document.removeEventListener('contextmenu', this.toggleRightClickMenu);
  }

  @Watch('angleStart')
  onAngleStartChange(newValue?: number): void {
    this.hostElement.style.setProperty('--mds-radial-menu-angle-start', `${newValue}deg`);
    this.setIsFullCircle();
    this.setIsStartGreaterThanEnd();
  }

  @Watch('angleEnd')
  onAngleEndChange(newValue?: number): void {
    this.hostElement.style.setProperty('--mds-radial-menu-angle-end', `${newValue}deg`);
    this.setIsFullCircle();
    this.setIsStartGreaterThanEnd();
  }

  @Watch('radius')
  onRadiusChange(newValue?: number): void {
    this.hostElement.style.setProperty('--mds-radial-menu-radius', `${newValue}rem`);
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
  }

  render() {
    return (
      <Host>
        <mds-button
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
