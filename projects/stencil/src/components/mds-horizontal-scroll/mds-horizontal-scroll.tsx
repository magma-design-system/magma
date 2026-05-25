import { Component, Element, Host, h, Prop, State, Watch } from '@stencil/core';
import { SnapType, NavigationType, ViewportType } from './meta/types';
import miBaselineArrowBack from '@icon/mi/baseline/arrow-back.svg';
import miBaselineArrowForward from '@icon/mi/baseline/arrow-forward.svg';
import clsx from 'clsx';
import { cssSizeToNumber } from '@common/unit';

// TODO [fix] buttons now shows up when they should
// TODO [fix] scrollbar not showing anymore

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-horizontal-scroll',
  styleUrl: 'mds-horizontal-scroll.css',
  shadow: true,
})
export class MdsHorizontalScroll {
  @Element() private host: HTMLMdsHorizontalScrollElement;
  private elements: Node[];
  private contents: HTMLElement;
  private spacer: HTMLElement;
  private navigationDots: HTMLElement;
  private navigationDot: HTMLElement;
  private scrollGap: number;
  private lastElementOffsetLeft: number;
  @State() hasCompatibility: boolean = true;
  @State() showForward = true;
  @State() showBack = false;

  /**
   * Specifies the viewport which will display navigation controls
   */
  @Prop({ reflect: true, mutable: true }) controls?: ViewportType = 'desktop';

  /**
   * Specifies the box’s snap position as an alignment of its snap area
   */
  @Prop({ reflect: true }) readonly navigation?: NavigationType = 'position';

  /**
   * Specifies the box’s snap position as an alignment of its snap area
   */
  @Prop({ reflect: true }) readonly snap?: SnapType = 'start';

  @Watch('navigation')
  watchNavigation(newValue: NavigationType): void {
    if (newValue === 'position') {
      this.addNavigationDots();
    }
  }

  private updateElements = (): void => {
    this.elements = this.host.shadowRoot?.querySelectorAll('slot')[0]?.assignedNodes() as Node[];
  };

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.host);
    this.scrollGap = cssSizeToNumber(elementStyles.getPropertyValue('--mds-horizontal-scroll-gap'));
  };

  private isInViewport = (element: HTMLElement): boolean => {
    if (!this.contents) {
      return false;
    }
    const spacerWidth = this.spacer.offsetWidth + this.scrollGap;
    const rect = element.getBoundingClientRect();
    const rectWrapper = this.contents.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= spacerWidth &&
      rect.bottom <= rectWrapper.height &&
      rect.right <= rectWrapper.width - spacerWidth * 2
    );
  };

  // private isInViewportContents = (element: HTMLElement): boolean => {
  //   if (!this.contents) {
  //     return false
  //   }
  //   const spacerWidth = this.spacer.offsetWidth + this.scrollGap
  //   const rect = element.getBoundingClientRect()
  //   const rectWrapper = this.contents.getBoundingClientRect()
  //   return (
  //     rect.top >= 0 &&
  //     rect.left >= spacerWidth &&
  //     rect.bottom <= rectWrapper.height &&
  //     rect.right <= rectWrapper.width - spacerWidth * 2
  //   )
  // }

  private checkNavigationButtons = (): void => {
    if (!this.elements) {
      throw Error('No elements slotted to the component');
    }
    this.showBack = true;
    this.showForward = true;
    this.elements.forEach((element: HTMLElement, index: number) => {
      if (index === 0 && this.isInViewport(element)) {
        this.showBack = false;
      }

      if (this.elements.length - 1 === index && this.isInViewport(element)) {
        this.showForward = false;
      }
    });
  };

  private moveBack = (): void => {
    if (!this.elements) {
      throw Error('No elements slotted to the component');
    }

    let firstIndex: number = 0;
    let elFirstInViewport: HTMLElement | undefined;
    let elLastInViewport: HTMLElement | undefined;

    this.elements.forEach((element: HTMLElement, index: number) => {
      // element.style.backgroundColor = 'transparent'
      if (this.isInViewport(element)) {
        if (!elFirstInViewport) {
          firstIndex = index;
          elFirstInViewport = element;
        }
        // element.style.backgroundColor = 'red'
        elLastInViewport = element;
      }
    });

    this.elements.forEach((element: HTMLElement, index: number) => {
      if (
        !this.isInViewport(element) &&
        index === firstIndex - 1 &&
        elFirstInViewport !== undefined &&
        elLastInViewport !== undefined
      ) {
        // element.style.backgroundColor = 'red'
        this.contents.scrollLeft =
          this.contents.scrollLeft +
          element.offsetLeft -
          elLastInViewport.offsetLeft -
          elFirstInViewport.offsetWidth -
          this.scrollGap;
      }
    });
  };

  private moveForward = (): void => {
    if (!this.elements) {
      throw Error('No elements slotted to the component');
    }

    let isFirstOutside = true;

    this.elements.forEach((element: HTMLElement) => {
      // element.style.backgroundColor = 'white'
      if (!this.isInViewport(element)) {
        if (element.offsetLeft > this.contents.scrollLeft && isFirstOutside) {
          isFirstOutside = false;
          // element.style.backgroundColor = 'red'
          this.lastElementOffsetLeft = element.offsetLeft;
          this.contents.scrollLeft = this.lastElementOffsetLeft;
        }
      }
    });
  };

  private translateNavigationDot = (): void => {
    if (!this.elements || !this.contents || !this.navigationDot || !this.navigationDots) {
      console.error(
        'mds-horizontal-scroll.translateNavigationDot: One of the shadowRoot elements is missing.',
      );
      return;
    }

    const { scrollLeft, scrollWidth, offsetWidth } = this.contents;
    const navigationStyles = window.getComputedStyle(this.navigationDots);

    const paddingLeft = parseFloat(navigationStyles.paddingLeft) || 0;
    const paddingRight = parseFloat(navigationStyles.paddingRight) || 0;

    const navigationWidth = this.navigationDots.offsetWidth - paddingLeft - paddingRight;
    const dotWidth = this.navigationDot.offsetWidth;

    if (offsetWidth === 0 || scrollWidth === 0) {
      console.error(
        'mds-horizontal-scroll.translateNavigationDot: offsetWidth or scrollWidth is 0, impossible to calculate position',
      );
      return;
    }

    // Calcolo della posizione normalizzata
    const maxScrollLeft = scrollWidth - offsetWidth;
    const normalizedScroll = scrollLeft / maxScrollLeft; // Valore tra 0 e 1
    const maxTranslate = navigationWidth - dotWidth; // Limite massimo di spostamento

    const translationX = normalizedScroll * maxTranslate;

    this.navigationDot.style.transform = `translateX(${translationX}px)`;
  };

  private updateNavigationDotSize = (): void => {
    if (!this.contents || !this.navigationDot || !this.navigationDots) {
      console.error(
        'mds-horizontal-scroll.updateNavigationDotSize: One of the shadowRoot elements is missing.',
      );
      return;
    }
    const { scrollWidth, offsetWidth } = this.contents;
    const navigationWidth = this.navigationDots.offsetWidth;
    if (scrollWidth <= offsetWidth) {
      // Se non c'è scroll, il dot occupa tutto lo spazio
      this.navigationDot.style.width = `${navigationWidth}px`;
      return;
    }
    // Calcolo proporzionale
    const dotWidth = (offsetWidth / scrollWidth) * navigationWidth;
    this.navigationDot.style.width = `${dotWidth}px`;
  };

  private addNavigationDots = (): void => {
    this.contents.removeEventListener('scroll', this.translateNavigationDot);
    this.navigationDot = this.host.shadowRoot?.querySelector('.dot') as HTMLElement;
    this.navigationDots = this.host.shadowRoot?.querySelector('.dot-navigation') as HTMLElement;
    this.updateNavigationDotSize();
    if (!this.navigationDot) return;
    this.contents.addEventListener('scroll', this.translateNavigationDot);
  };

  componentWillLoad(): void {
    this.updateCSSCustomProps();
  }

  componentDidLoad(): void {
    this.contents = this.host.shadowRoot?.querySelector('.contents') as HTMLElement;
    this.spacer = this.host.shadowRoot?.querySelector('.spacer') as HTMLElement;
    if (this.navigation === 'position') this.addNavigationDots();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (window && typeof (window as any).onscrollend !== 'undefined') {
      this.contents.addEventListener('scrollend', this.checkNavigationButtons);
    } else {
      if (this.controls) this.controls = undefined;
    }
  }

  disconnectedCallback(): void {
    this.contents.removeEventListener('scrollend', this.checkNavigationButtons);
    this.contents.removeEventListener('scroll', this.translateNavigationDot);
  }

  render() {
    return (
      <Host>
        <div class="contents" part="content">
          <div class="spacer"></div>
          <slot onSlotchange={this.updateElements}></slot>
          <div class="spacer"></div>
        </div>
        <div class="dot-navigation">
          <div class="dot"></div>
        </div>
        {this.controls && this.controls !== 'none' && (
          <mds-button
            onClick={this.moveBack}
            size="lg"
            class={clsx('navigation navigation--back', !this.showBack && 'navigation--disabled')}
            icon={miBaselineArrowBack}
          ></mds-button>
        )}
        {this.controls && this.controls !== 'none' && (
          <mds-button
            onClick={this.moveForward}
            size="lg"
            class={clsx(
              'navigation navigation--forward',
              !this.showForward && 'navigation--disabled',
            )}
            icon={miBaselineArrowForward}
          ></mds-button>
        )}
      </Host>
    );
  }
}
