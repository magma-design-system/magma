import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  h,
  Prop,
  Watch,
  State,
} from '@stencil/core';
import { MdsTabEventDetail } from './meta/event-detail';
import { MdsTabItemEventDetail } from '@component/mds-tab-item/meta/event-detail';
import { setAttributeIfEmpty, hashRandomValue } from '@common/aria';
import { HorizontalActionsAnimationType } from '@type/animation';
import clsx from 'clsx';
import { cssDurationToMilliseconds } from '@common/unit';
import { TabSizeType } from '@type/button';
import { DirectionType } from './meta/type';

/**
 * @part contents - Selects the container of the tabbed contents elements.
 * @part slider - Selects the slider element which is visible when attribute `animation` is set to `slide`.
 * @part tabs - Selects the container of `mds-tab-item` list elements.
 * @slot content - Add `HTML elements` or `components`, one per mds-tab-item added.
 * @slot - Add `mds-tab-item` element/s.
 */

@Component({
  tag: 'mds-tab',
  styleUrl: 'mds-tab.css',
  shadow: true,
})
export class MdsTab {
  @Element() private element: HTMLMdsTabElement;
  private currentItemIndex: number = -1;
  private currentItemEl: HTMLMdsTabItemElement;
  private tabs: HTMLElement;
  private tabsContainer: HTMLElement;
  private observer: ResizeObserver;
  private tabItems: Array<HTMLMdsTabItemElement> = [];
  private contentItems: Array<HTMLElement> = [];
  private cssSlideDelayDuration: string;
  @State() sliderWidth: number = -1;
  @State() sliderHeight: number = -1;
  @State() sliderOffsetX: number = -1;
  @State() sliderOffsetY: number = -1;
  @State() overflowLeft: boolean = false;
  @State() overflowRight: boolean = false;

  /**
   * Sets if the component distributes item vertically or horzontally
   */
  @Prop({ reflect: true, mutable: true }) direction?: DirectionType = 'horizontal';

  /**
   * Shows the horizontal scrollbar to maximize accessibility
   */
  @Prop({ reflect: true, mutable: true }) scrollbar?: boolean;

  /**
   * Sets the animation type of the selection transition between `mds-tab-item` elements
   */
  @Prop({ reflect: true }) readonly animation?: HorizontalActionsAnimationType = 'slide';

  /**
   * Sets if the tab area should fill the entire width
   */
  @Prop({ reflect: true, mutable: true }) fill?: boolean;

  /**
   * Sets if the tab area should show an inset shadow when the tabs overflows it's container
   */
  @Prop({ reflect: true, mutable: true }) overflow?: boolean;

  /**
   * Sets the size of the component items nested inside it
   */
  @Prop({ reflect: true, mutable: true }) size?: TabSizeType;

  /**
   * Emits when a children is changed
   */
  @Event({ eventName: 'mdsTabChange' }) changedEvent: EventEmitter<MdsTabEventDetail>;

  private queryContentItems = (): Array<HTMLElement> =>
    Array.from(this.element.querySelectorAll<HTMLElement>(':scope > [slot=content]'));

  componentWillLoad(): void {
    this.setTabsItems();
  }

  disconnectedCallback(): void {
    this.unsetOverflowCheck();
  }

  componentDidLoad(): void {
    this.updateCSSCustomProps();
    this.tabs = this.element.shadowRoot?.querySelector('.tabs') as HTMLElement;
    this.tabsContainer = this.element.shadowRoot?.querySelector('.tabs-wrapper') as HTMLElement;
    // attach onSlotChange event here to prevent fire event before componentDidLoad
    this.element.shadowRoot
      ?.querySelector('slot')
      ?.addEventListener('slotchange', this.updateTabItems.bind(this));
    this.updateContentItems();
    this.initOverflowCheck();
    this.updateSliderPosition();
    if (this.currentItemIndex > 0) {
      this.scrollTabs(this.currentItemIndex);
    }
  }

  private updateContentItems = (): void => {
    this.contentItems = this.queryContentItems();
    this.contentItems.forEach((item: HTMLElement, key: number): void => {
      setAttributeIfEmpty(item, 'role', 'tabpanel');
      setAttributeIfEmpty(item, 'aria-labelledby', this.tabItems[key].id);
    });
    this.selectContentItem();
  };

  private setTabsItems = () => {
    this.tabItems = Array.from(
      this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item'),
    );
    this.currentItemIndex = -1;
    this.tabItems.forEach((item) => {
      item.size = this.size;
    });

    this.tabItems.forEach((item, key) => {
      if (item.id === '') {
        setAttributeIfEmpty(item, 'id', hashRandomValue('mds-tab-item'));
      }
      if (item.selected) {
        this.currentItemIndex = key;
        this.currentItemEl = this.tabItems[this.currentItemIndex];
      }
    });
  };

  private updateTabItems = (): void => {
    this.setTabsItems();
    if (this.overflow) this.updateOverflowState();
    this.updateSliderPosition();
    this.scrollTabs(this.currentItemIndex);
  };

  private unsetOverflowCheck = (): void => {
    this.tabs.removeEventListener('scroll', this.updateOverflowState);
    this.observer.unobserve(this.tabsContainer);
  };

  private initOverflowCheck = (): void => {
    this.tabs.addEventListener('scroll', this.updateOverflowState);
    this.observer = new ResizeObserver(() => {
      if (this.overflow) this.updateOverflowState();
      this.updateSliderPosition();
    });
    this.observer.observe(this.tabsContainer);
    this.updateOverflowState();
  };

  private updateOverflowState = (): void => {
    if (this.tabs == null || this.tabsContainer == null) return;

    const containerWidth = this.tabsContainer.offsetWidth;
    const tabsWidth = this.tabs.scrollWidth;
    const { scrollLeft } = this.tabs;

    this.overflowLeft = scrollLeft > 0;
    this.overflowRight = Math.ceil(scrollLeft + containerWidth) < tabsWidth - 1;
  };

  private updateSliderPosition = (): void => {
    if (this.animation === 'slide' && this.currentItemIndex >= 0) {
      self.requestAnimationFrame(() => {
        this.sliderWidth = this.currentItemEl.offsetWidth;
        this.sliderHeight = this.currentItemEl.offsetHeight;
        this.sliderOffsetX = this.currentItemEl.offsetLeft - this.tabsContainer.offsetLeft;
        this.sliderOffsetY =
          this.currentItemEl.offsetTop -
          this.tabsContainer.offsetTop +
          this.currentItemEl.offsetHeight -
          this.sliderHeight;
      });
    } else {
      this.sliderHeight = -1;
      this.sliderOffsetX = -1;
      this.sliderOffsetY = -1;
      this.sliderWidth = -1;
    }
  };

  private scrollTabs = (key: number): void => {
    const tabItem = this.tabItems[key];
    setTimeout(() => {
      this.tabs.scrollLeft =
        tabItem.offsetLeft -
        this.tabs.offsetLeft -
        this.tabs.offsetWidth / 2 +
        tabItem.offsetWidth / 2;
      this.updateOverflowState();
    }, cssDurationToMilliseconds(this.cssSlideDelayDuration));
  };

  private selectContentItem = (): void => {
    this.contentItems.forEach((item: HTMLElement, index: number) => {
      item.setAttribute('mds-tab-content-hidden', '');
      if (index === this.currentItemIndex) {
        item.removeAttribute('mds-tab-content-hidden');
      }
    });
  };

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.element);
    this.cssSlideDelayDuration = elementStyles.getPropertyValue('--mds-tab-slide-delay');
  };

  @Listen('mdsTabItemSelect')
  changeEventHandler(event: CustomEvent<MdsTabItemEventDetail>): void {
    // since the external developer can define a custom id
    // we must find the key from event.detail
    this.tabItems.forEach((item, key: number) => {
      if (item.id === event.detail.target.id) {
        this.changedEvent.emit({ id: key, value: item.value });
        this.currentItemIndex = key;
        this.currentItemEl = this.tabItems[this.currentItemIndex];
        this.scrollTabs(key);
        item.selected = true;
        // for some reason, mds-tab-item looses focus when we click Enter with the keyboard,
        // which forces user to find again where the tab is with keyboard
        const mdsTabEl: HTMLMdsButtonElement = this.tabItems[
          this.currentItemIndex
        ].shadowRoot?.querySelector('mds-button') as HTMLMdsButtonElement;
        setTimeout(() => {
          mdsTabEl.focus();
        }, 0);
        return;
      }
      item.selected = undefined;
    });
    this.selectContentItem();
    this.updateSliderPosition();
  }

  @Listen('mdsTabItemFocus')
  focusEventHandler(event: CustomEvent<MdsTabItemEventDetail>): void {
    this.tabItems.forEach((item, key: number) => {
      if (item.id === event.detail.target.id) {
        this.scrollTabs(key);
      }
    });
  }

  @Watch('animation')
  handleAnimationChange(): void {
    this.updateSliderPosition();
  }

  @Watch('scrollbar')
  handleScrollbarChange(newValue?: boolean): void {
    if (newValue === false) {
      this.scrollbar = undefined;
    }
  }

  @Watch('fill')
  handleFillChange(newValue?: boolean): void {
    if (newValue === false) {
      this.fill = undefined;
    }
  }

  @Watch('overflow')
  handleOverflowChange(newValue?: boolean): void {
    if (!newValue) {
      this.unsetOverflowCheck();
      return;
    }
    this.initOverflowCheck();
  }

  @Watch('size')
  handleSizeChange(newValue?: TabSizeType): void {
    this.tabItems.forEach((element: HTMLMdsTabItemElement) => {
      element.size = newValue;
    });
  }

  render() {
    return (
      <Host>
        <div class={clsx('tabs-wrapper', this.fill && 'tabs-wrapper--fill')}>
          {this.overflow && (
            <div
              class={clsx(
                'tabs-wrapper-overflow-left',
                this.overflowLeft && 'tabs-wrapper-overflow-left--show',
              )}
            ></div>
          )}
          {this.overflow && (
            <div
              class={clsx(
                'tabs-wrapper-overflow-right',
                this.overflowRight && 'tabs-wrapper-overflow-right--show',
              )}
            ></div>
          )}
          <div class="tabs" part="tabs" role="tablist">
            <slot />
            {this.animation === 'slide' && (
              <div
                class="slider"
                part="slider"
                style={{
                  '--mds-tab-slider-width': `${this.sliderWidth}px`,
                  '--mds-tab-slider-height': `${this.sliderHeight}px`,
                  '--mds-tab-slider-offset-x': `${this.sliderOffsetX}px`,
                  '--mds-tab-slider-offset-y': `${this.sliderOffsetY}px`,
                }}
              ></div>
            )}
          </div>
        </div>
        <div class="contents" part="contents">
          <slot name="content" onSlotchange={this.updateContentItems} />
        </div>
      </Host>
    );
  }
}
