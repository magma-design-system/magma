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
import { queryChildrenBySlot } from '@common/slot';
import { MdsTabEventDetail } from './meta/event-detail';
import { MdsTabItemEventDetail } from '@component/mds-tab-item/meta/event-detail';
import { setAttributeIfEmpty, hashRandomValue } from '@common/aria';
import { HorizontalActionsAnimationType } from '@type/animation';
import clsx from 'clsx';
import { cssDurationToMilliseconds } from '@common/unit';
import { preferenceStore } from '@common/preference';
import { TabSizeType } from '@type/button';
import { InputSizeType } from '@type/input';
import { MdsInputSelectEventDetail } from '@component/mds-input-select/meta/event-detail';
import { DirectionType, NarrowType } from './meta/type';

/** An option of the select that `narrow="select"` shows in place of the strip: one per item. */
interface NarrowOption {
  disabled: boolean;
  id: string;
  label: string;
}

// the attributes of an item its option copies: a change of one rewrites the options
const NARROW_OPTION_ATTRIBUTES = ['disabled', 'label', 'title', 'value'];

/**
 * @part contents - Selects the container of the tabbed contents elements.
 * @part select - Selects the `mds-input-select` shown in place of the strip on a narrow container, with `narrow="select"`.
 * @part slider - Selects the slider element which is visible when attribute `animation` is set to `slide`.
 * @part tabs - Selects the container of `mds-tab-item` list elements.
 * @slot content - Add `HTML elements` or `components`, one per mds-tab-item added; or none, when the
 * items are links (`href`) to other pages or places and the page, not the component, shows the
 * content.
 * @slot - Add `mds-tab-item` element/s.
 * @category navigation
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
  private observer?: ResizeObserver;
  private itemObserver?: MutationObserver;
  private selectEl?: HTMLMdsInputSelectElement;
  private tabItems: Array<HTMLMdsTabItemElement> = [];
  private contentItems: Array<HTMLElement> = [];
  private cssSlideDelayDuration: string;
  @State() sliderWidth: number = -1;
  @State() sliderHeight: number = -1;
  @State() sliderOffsetX: number = -1;
  @State() sliderOffsetY: number = -1;
  /** the slider slides only to follow a selection, any other move draws it in place */
  @State() sliderSlides: boolean = false;
  @State() overflowLeft: boolean = false;
  @State() overflowRight: boolean = false;
  /** every item is a link: the strip is a navigation, not a tablist */
  @State() navigation: boolean = false;
  @State() hasContent: boolean = false;
  /** the items as the options of the select of narrow="select", in their order */
  @State() narrowOptions: Array<NarrowOption> = [];
  /** the id of the selected item, the value of that select; none while no item is selected */
  @State() selectedId?: string;

  /**
   * The name assistive technology announces for the group of tabs: on the strip, when it is a
   * tablist, and on the select that `narrow="select"` shows in its place, which has no other
   * name. The page title or the heading above the tabs does not name them: write it here.
   */
  @Prop({ attribute: 'aria-label' }) readonly accessibleName?: string;

  /**
   * What the strip does when its container is narrower than 768px (`--container-3xl`, the
   * threshold under which `mds-header` shows its mobile menu): `scroll` keeps the row of tabs,
   * which scrolls sideways; `select` shows the tabs as the options of a select in its place, the
   * selected tab as its value, and choosing an option does what a click on its tab does. Use
   * `select` for a long row, as the sections of a settings page. With `select` the component
   * takes the width of its container, the width the threshold is measured on.
   */
  @Prop({ reflect: true }) readonly narrow?: NarrowType = 'scroll';

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
    queryChildrenBySlot(this.element, 'content');

  componentWillLoad(): void {
    this.setTabsItems();
    this.hasContent = this.queryContentItems().length > 0;
  }

  // a strip moved in the page is disconnected and connected again, without loading again: the
  // check of its scroll and size starts again here. On the first connection it is not drawn yet,
  // and componentDidLoad starts it
  connectedCallback(): void {
    this.initOverflowCheck();
    this.observeItems();
  }

  disconnectedCallback(): void {
    this.unsetOverflowCheck();
    this.itemObserver?.disconnect();
    this.itemObserver = undefined;
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
    this.hasContent = this.contentItems.length > 0;
    // a panel past the last item has no tab to open it: it stays hidden, named by nothing
    if (this.contentItems.length > this.tabItems.length) {
      console.warn(
        `mds-tab: ${this.contentItems.length} content panels for ${this.tabItems.length} mds-tab-item, the panels past the last item are never shown`,
      );
    }
    this.contentItems.forEach((item: HTMLElement, key: number): void => {
      setAttributeIfEmpty(item, 'role', 'tabpanel');
      if (key < this.tabItems.length) {
        setAttributeIfEmpty(item, 'aria-labelledby', this.tabItems[key].id);
      }
    });
    this.selectContentItem();
  };

  private setTabsItems = () => {
    this.tabItems = Array.from(
      this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item'),
    );
    this.currentItemIndex = -1;
    this.navigation =
      this.tabItems.length > 0 && this.tabItems.every((item) => (item.href ?? '') !== '');
    this.tabItems.forEach((item) => {
      item.size = this.size;
      item.direction = this.direction;
      item.animation = this.animation;
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
    this.selectedId = this.currentItemIndex >= 0 ? this.currentItemEl.id : undefined;
    this.updateNarrowOptions();
    this.observeItems();
  };

  /**
   * The options of the select of `narrow="select"`, one per item: its label, else its title (the
   * name of an item with an icon alone), else its value. An option shows no icon.
   */
  private updateNarrowOptions = (): void => {
    this.narrowOptions = this.tabItems.map((item) => ({
      disabled: !!item.disabled,
      id: item.id,
      label: item.label || item.title || item.value || '',
    }));
  };

  /**
   * The select copies the label and the state of every item: with `narrow="select"`, a change of
   * one after the load rewrites the options. Only the items are watched, and only those
   * attributes; the selection reaches the strip through the event of the item.
   */
  private observeItems = (): void => {
    this.itemObserver?.disconnect();
    if (this.narrow !== 'select' || typeof MutationObserver === 'undefined') {
      this.itemObserver = undefined;
      return;
    }
    this.itemObserver ??= new MutationObserver(this.updateNarrowOptions);
    this.tabItems.forEach((item) =>
      this.itemObserver?.observe(item, {
        attributeFilter: NARROW_OPTION_ATTRIBUTES,
        attributes: true,
      }),
    );
  };

  /**
   * An option chosen does what a click on its tab does, on the same path: a tab selects its
   * panel and the strip emits `mdsTabChange`, a link is followed, through the router registered
   * with `NavigationService` when there is one, and a click listener on the item can still
   * cancel it. The change of the select is a part of the strip: the page hears `mdsTabChange`.
   */
  private selectFromOption = (event: CustomEvent<MdsInputSelectEventDetail>): void => {
    event.stopPropagation();
    const item = this.tabItems.find((tab) => tab.id === event.detail.value);
    if (item != null && item !== this.currentItemEl && !item.disabled) {
      item.shadowRoot?.querySelector<HTMLMdsButtonElement>('mds-button')?.click();
    }
    // an option that selected no tab (the empty one, shown while none is selected) leaves the
    // select on the tab that is
    if (this.selectEl != null && (this.selectEl.value ?? '') !== (this.selectedId ?? '')) {
      this.selectEl.value = this.selectedId ?? '';
    }
  };

  // the size of the field, from the height of the strip it takes the place of: a strip md is
  // 52px (an item of 36px and its padding), the field lg 48px; a strip sm 44px, the field md 36px
  private narrowSelectSize = (): InputSizeType => (this.size === 'sm' ? 'md' : 'lg');

  private updateTabItems = (): void => {
    this.setTabsItems();
    if (this.overflow) this.updateOverflowState();
    this.updateSliderPosition();
    this.scrollTabs(this.currentItemIndex);
  };

  // The strip is watched while it is drawn and in the page: its scroll for the overflow shadows,
  // its size for those and for the slider. A strip removed before its first load has neither
  // parts nor observer: its teardown used to read them and throw (#1245)
  private unsetOverflowCheck = (): void => {
    this.tabs?.removeEventListener('scroll', this.updateOverflowState);
    this.observer?.disconnect();
    this.observer = undefined;
  };

  private initOverflowCheck = (): void => {
    // not drawn yet: componentDidLoad starts the check. Out of the page (removed before its load
    // ended): connectedCallback starts it when the strip comes back
    if (this.tabs == null || this.tabsContainer == null || !this.element.isConnected) return;
    // one check at a time: a second observer would keep running after the teardown
    this.unsetOverflowCheck();
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

  /**
   * Moves the slider under the selected item. It slides there only to follow a selection
   * (`slide`): on load, after a change of the layout, or when the strip is shown again after
   * being hidden, it is drawn in place, so the strip appears with the selected tab already
   * marked (#924).
   */
  private updateSliderPosition = (slide = false): void => {
    if (this.animation === 'slide' && this.currentItemIndex >= 0) {
      self.requestAnimationFrame(() => {
        // a hidden strip has no box, and every measure reads 0: the slider keeps its place
        // instead of collapsing in the corner, and the observer moves it once the strip is shown
        if (!this.currentItemEl.offsetWidth) return;
        this.sliderSlides = slide;
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
    // no item selected: nothing to bring into view
    if (key < 0 || key >= this.tabItems.length) return;
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
    // the focus goes back to the selected item only when it was in the strip: an item selected
    // from code, while the user is elsewhere, does not pull the focus away (#341). An option
    // chosen in the select of narrow="select" leaves it on the select: the strip is hidden then,
    // and an item that is not drawn takes no focus
    const focused = this.element.matches(':focus-within');
    // since the external developer can define a custom id
    // we must find the key from event.detail
    this.tabItems.forEach((item, key: number) => {
      if (item.id === event.detail.target.id) {
        this.changedEvent.emit({ id: key, value: item.value });
        this.currentItemIndex = key;
        this.currentItemEl = this.tabItems[this.currentItemIndex];
        this.selectedId = item.id;
        this.scrollTabs(key);
        item.selected = true;
        // for some reason, mds-tab-item looses focus when we click Enter with the keyboard,
        // which forces user to find again where the tab is with keyboard
        const mdsTabEl: HTMLMdsButtonElement = this.tabItems[
          this.currentItemIndex
        ].shadowRoot?.querySelector('mds-button') as HTMLMdsButtonElement;
        if (focused) {
          setTimeout(() => {
            mdsTabEl.focus();
          }, 0);
        }
        return;
      }
      item.selected = undefined;
    });
    this.selectContentItem();
    this.updateSliderPosition(true);
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
  handleAnimationChange(newValue?: HorizontalActionsAnimationType): void {
    this.tabItems.forEach((element: HTMLMdsTabItemElement) => {
      element.animation = newValue;
    });
    this.updateSliderPosition();
  }

  @Watch('direction')
  handleDirectionChange(newValue?: DirectionType): void {
    this.tabItems.forEach((element: HTMLMdsTabItemElement) => {
      element.direction = newValue;
    });
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

  // the strip is watched whatever overflow says, since its observer moves the slider too: turned
  // off, the check used to stop and the slider no longer followed the layout; turned on, a
  // second observer started next to the first. The shadows only need the current state
  @Watch('overflow')
  handleOverflowChange(newValue?: boolean): void {
    if (newValue) this.updateOverflowState();
  }

  @Watch('narrow')
  handleNarrowChange(): void {
    this.observeItems();
  }

  @Watch('size')
  handleSizeChange(newValue?: TabSizeType): void {
    this.tabItems.forEach((element: HTMLMdsTabItemElement) => {
      element.size = newValue;
    });
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.narrow === 'select' && (
          <mds-input-select
            aria-label={this.accessibleName}
            class="select"
            onMdsInputSelectChange={this.selectFromOption}
            part="select"
            ref={(el) => (this.selectEl = el)}
            size={this.narrowSelectSize()}
            value={this.selectedId ?? ''}
          >
            {/* while no tab is selected the field is empty, as the strip shows none: an empty
                option first, hidden from the list, which the select falls on */}
            {this.selectedId === undefined && <option hidden key="none" value=""></option>}
            {this.narrowOptions.map((option) => (
              // the select copies its options when they are added: an option whose label or
              // state changes is a new one, so the copy follows
              <option
                disabled={option.disabled}
                key={`${option.id}|${option.label}|${option.disabled}`}
                value={option.id}
              >
                {option.label}
              </option>
            ))}
          </mds-input-select>
        )}
        <div
          class={clsx(
            'tabs-wrapper',
            this.fill && 'tabs-wrapper--fill',
            !this.hasContent && 'tabs-wrapper--no-content',
          )}
        >
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
          <div
            aria-label={this.navigation ? undefined : this.accessibleName}
            class="tabs"
            part="tabs"
            role={this.navigation ? undefined : 'tablist'}
          >
            <slot />
            {this.animation === 'slide' && (
              <div
                class={clsx('slider', !this.sliderSlides && 'slider--still')}
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
        <div class={clsx('contents', !this.hasContent && 'contents--empty')} part="contents">
          <slot name="content" onSlotchange={this.updateContentItems} />
        </div>
      </Host>
    );
  }
}
