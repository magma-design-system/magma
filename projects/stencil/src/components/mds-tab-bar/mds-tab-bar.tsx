import { Component, Event, EventEmitter, Element, Host, h, Listen } from '@stencil/core';
import { MdsTabBarEventDetail } from './meta/event-detail';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Add `mds-tab-bar-item` element/s.
 * @category navigation
 */

@Component({
  tag: 'mds-tab-bar',
  styleUrl: 'mds-tab-bar.css',
  shadow: true,
})
export class MdsTabBar {
  @Element() private element: HTMLMdsTabBarElement;

  /**
   * Emits when a step is changed
   */
  @Event({ eventName: 'mdsTabBarChange' }) changedEvent: EventEmitter<MdsTabBarEventDetail>;

  private queryItems = (): NodeListOf<HTMLMdsTabBarItemElement> =>
    this.element.querySelectorAll<HTMLMdsTabBarItemElement>('mds-tab-bar-item');

  // An item keeps the id its author gave it, one without gets `mds-tab-bar-item-<index>`, what its
  // event reported before; the bar tells the items apart by element, not by id. It used to
  // overwrite every id (#827)
  componentWillLoad(): void {
    const items = this.queryItems();
    items.forEach((item, key) => {
      if (item.id === '') item.id = `mds-tab-bar-item-${key}`;
    });
  }

  @Listen('mdsTabBarItemSelect')
  changeEventHandler(event: CustomEvent<string>): void {
    const items = this.queryItems();
    items.forEach((item, key) => {
      item.selected = item === event.target;
      if (item.selected) {
        this.changedEvent.emit({ index: key });
      }
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
        <slot />
      </Host>
    );
  }
}
