import clsx from 'clsx';
import {
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

  @State() active?: boolean;
  @State() itemsSelected = 0;
  private lastSelectedItem: number;

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

  componentWillLoad(): void {
    const items = this.queryItems();
    items.forEach((item, key) => {
      item.id = `item-${key}`;
    });
    this.checkSelectedItem();
  }

  @Listen('mdsFilterItemSelect')
  activeEventHandler(event: CustomEvent<MdsFilterItemEventDetail>): void {
    this.lastSelectedItem = Number(
      event.detail.id !== '' ? event.detail.id.replace('item-', '') : 0,
    );
    this.scrollTabs();

    const items = this.queryItems();

    if (this.multiple) {
      let itemsSelected = 0;
      const list: (HTMLMdsFilterItemElement | null)[] = [];
      items.forEach((item, key) => {
        list.push(item.selected ? item : null);
        if (item.selected) {
          itemsSelected += 1;
        }
        item.classList.remove('sibling');
        if (list.length > 1 && list[key - 1] !== null) {
          item.classList.add('sibling');
        }
      });
      this.itemsSelected = itemsSelected;
      this.checkSelectedItem();
      if (this.itemsSelected === items.length) {
        this.checkAutoReset();
      }
      this.changedEvent.emit({ children: items, value: this.itemsValues() });
      return;
    }

    items.forEach((item, key) => {
      item.selected = `item-${key}` === event.detail.id && event.detail.selected;
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
        role="menubar"
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.label && (
          <mds-text class="label" typography="label">
            {this.label}
          </mds-text>
        )}
        <div class="items-wrapper">
          <div class={clsx('items', this.active && 'active')}>
            <slot />
            <div class={clsx('reset', this.active && 'reset--opened')}>
              <mds-filter-item
                selected={this.active}
                disabled={!this.active && this.reset}
                class={clsx('reset-button', this.active && 'reset-button-opened')}
                icon={miBaselineClose}
                onClick={this.resetItems}
              />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
