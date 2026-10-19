import clsx from 'clsx';
import {
  Build,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Listen,
  Prop,
  State,
} from '@stencil/core';
import { preferenceStore } from '@common/preference';
import { MdsFilterEventDetail } from './meta/event-detail';
import { MdsFilterItemEventDetail } from '@component/mds-filter-item/meta/event-detail';
import miBaselineClose from '@icon/mi/baseline/close.svg';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Add `mds-filter-item` element/s.
 */

@Component({
  tag: 'mds-filter',
  styleUrl: 'mds-filter.css',
  shadow: true,
})
export class MdsFilter {
  @Element() private element: HTMLMdsFilterElement;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @State() active?: boolean;
  @State() itemsSelected = 0;
  private lastSelectedItem: number;
  private selectionObserver?: MutationObserver;

  /**
   * Sets an automatic reset of active filters if all filters are triggered
   */
  @Prop({ reflect: true }) autoReset?: boolean;

  /**
   * Sets the label of the filter group
   */
  @Prop() label?: string;

  /**
   * Sets if the filter group can filter multiple filters simultaneously
   */
  @Prop({ reflect: true }) multiple?: boolean;

  /**
   * Shows a reset button if one or more filters are active
   */
  @Prop({ reflect: true }) reset?: boolean;

  private queryItems = (): NodeListOf<HTMLMdsFilterItemElement> =>
    this.element.querySelectorAll<HTMLMdsFilterItemElement>('mds-filter-item');

  /**
   * Centres the selected item in the strip. The measure is taken from the boxes
   * and applied as a delta on the current scroll: `offsetLeft` would mix two
   * coordinate systems, because the items are slotted light children and their
   * offsetParent is whatever is positioned above the host - the page, usually -
   * while the strip lives in the shadow root. The difference between the two is
   * the distance of the filter from that ancestor, so the further right the
   * component sits the more the scroll overshoots, until it clamps at the end of
   * the strip and pushes the clicked item against the left edge.
   */
  private scrollTabs = (): void => {
    const items = this.queryItems();
    const tabItem = items[this.lastSelectedItem];
    const itemsContainer = this.element.shadowRoot?.querySelector<HTMLElement>('.items');
    if (itemsContainer && tabItem) {
      const strip = itemsContainer.getBoundingClientRect();
      const item = tabItem.getBoundingClientRect();
      itemsContainer.scrollLeft += item.left - strip.left - (strip.width - item.width) / 2;
    }
  };

  private checkSelectedItem = (): void => {
    const items = this.queryItems();
    let active = false;
    items.forEach((item) => {
      if (item.selected) {
        active = true;
      }
    });
    this.active = active;
  };

  // in multiple mode an item that follows a selected one is marked `sibling`
  private markSiblings = (items: HTMLMdsFilterItemElement[]): void => {
    if (!this.multiple) {
      return;
    }
    items.forEach((item, key) => {
      item.classList.toggle('sibling', key > 0 && items[key - 1].selected === true);
    });
  };

  /**
   * The selection lives on the items: one the application selects or clears, or renders already
   * selected, is taken in as after a click - one item at a time in single mode, the last one set
   * winning, the reset button shown or hidden, the strip scrolled to it - but no `mdsFilterChange`
   * is emitted, the application already knows. A click goes through here too, once its listener
   * has done the same, and finds nothing left to change.
   */
  private syncSelection = (records: MutationRecord[]): void => {
    const items = Array.from(this.queryItems());
    let latest: HTMLMdsFilterItemElement | undefined;
    records.forEach((record) => {
      const nodes = record.type === 'childList' ? Array.from(record.addedNodes) : [record.target];
      nodes.forEach((node) => {
        const item = node as HTMLMdsFilterItemElement;
        if (items.includes(item) && item.selected === true) {
          latest = item;
        }
      });
    });
    if (!this.multiple) {
      this.keepOneSelected(items, latest);
    }
    if (latest) {
      this.lastSelectedItem = items.indexOf(latest);
      this.scrollTabs();
    }
    this.markSiblings(items);
    this.checkSelectedItem();
  };

  // single mode: of the selected items only `keep` stays, by default the last one, as in a select
  private keepOneSelected = (
    items: HTMLMdsFilterItemElement[],
    keep = items.filter((item) => item.selected === true).pop(),
  ): void => {
    items.forEach((item) => {
      if (item.selected === true && item !== keep) {
        item.selected = false;
      }
    });
  };

  private checkAutoReset = (): void => {
    if (!this.autoReset) {
      return;
    }
    this.resetItems();
  };

  private resetItems = (): void => {
    const items = this.queryItems();
    items.forEach((item) => {
      item.selected = false;
      item.classList.remove('sibling');
    });
    this.active = false;
  };

  // the reset button is an action of the filter: it clears the selection and tells the
  // application, as a click on the items does
  private handleResetClick = (): void => {
    if (!this.active) {
      return;
    }
    this.resetItems();
    this.changedEvent.emit({ children: this.queryItems(), value: this.itemsValues() });
  };

  private itemsValues = (): string => {
    const items = this.queryItems();
    const list: string[] = [];
    items.forEach((item) => {
      if (item.selected) {
        list.push(item.value);
      }
    });
    return list.toString();
  };

  connectedCallback(): void {
    this.selectionObserver?.disconnect();
    if (!Build.isBrowser) {
      return;
    }
    this.selectionObserver = new MutationObserver(this.syncSelection);
    this.selectionObserver.observe(this.element, {
      attributeFilter: ['selected'],
      childList: true,
      subtree: true,
    });
  }

  disconnectedCallback(): void {
    this.selectionObserver?.disconnect();
    this.selectionObserver = undefined;
  }

  componentWillLoad(): void {
    const items = this.queryItems();
    // an item keeps the id its author gave it, one without gets `item-<index>`, what its events
    // reported before; the filter tells the items apart by element. It used to overwrite every id
    // (#827)
    items.forEach((item, key) => {
      if (item.id === '') item.id = `item-${key}`;
    });
    if (!this.multiple) {
      this.keepOneSelected(Array.from(items));
    }
    this.checkSelectedItem();
  }

  @Listen('mdsFilterItemSelect')
  activeEventHandler(event: CustomEvent<MdsFilterItemEventDetail>): void {
    const items = this.queryItems();
    // the item itself, not its id: an item rendered after the load has none
    const target = event.target as HTMLMdsFilterItemElement;
    this.lastSelectedItem = Array.from(items).indexOf(target);
    this.scrollTabs();

    if (this.multiple) {
      this.markSiblings(Array.from(items));
      this.itemsSelected = Array.from(items).filter((item) => item.selected === true).length;
      this.checkSelectedItem();
      if (this.itemsSelected === items.length) {
        this.checkAutoReset();
      }
      this.changedEvent.emit({ children: items, value: this.itemsValues() });
      return;
    }

    items.forEach((item) => {
      item.selected = item === target && event.detail.selected;
    });
    this.checkSelectedItem();
    this.changedEvent.emit({ children: items, value: this.itemsValues() });
  }

  /**
   * Emits when the one of the children is changed
   */
  @Event({ eventName: 'mdsFilterChange' }) changedEvent: EventEmitter<MdsFilterEventDetail>;

  render() {
    return (
      <Host
        aria-label={this.label}
        role="group"
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.label && (
          <mds-text aria-hidden="true" class="label" typography="label">
            {this.label}
          </mds-text>
        )}
        <div class="items-wrapper">
          <div class={clsx('items', this.active && 'active')}>
            <slot />
            {this.reset && (
              <div class={clsx('reset', this.active && 'reset--opened')}>
                {/* with no filter active the button is scaled away: out of the tab order and of
                    the accessibility tree too */}
                <mds-filter-item
                  aria-hidden={this.active ? undefined : 'true'}
                  aria-label={this.t.get('clearFilters')}
                  selected={this.active}
                  disabled={!this.active}
                  class={clsx('reset-button', this.active && 'reset-button-opened')}
                  icon={miBaselineClose}
                  onClick={this.handleResetClick}
                />
              </div>
            )}
          </div>
        </div>
      </Host>
    );
  }
}
