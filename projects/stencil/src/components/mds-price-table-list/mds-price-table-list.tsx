import { Component, Host, h, Element, State } from '@stencil/core';
import { preferenceStore } from '@common/preference';
import { observeChildren } from '@common/slot';

/**
 * @part content - Selects the element which wraps elements added via `default slot`
 * @part footer - Selects the element which wraps elements added via `slot="price"` and `slot="action"`
 * @part header - Selects the element which wraps elements added via `slot="header"`
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot item - Add `mds-price-table-list-item` component, `HTML elements` or other `components` to this slot.
 * @slot header - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot price - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-price-table-list',
  styleUrl: 'mds-price-table-list.css',
  shadow: true,
})
export class MdsPriceTableList {
  @State() hasItems: boolean;
  @Element() hostElement: HTMLMdsPriceTableListElement;

  // The region of the items is rendered only with items, so no slotchange tells the list of the
  // ones rendered after load, a page that fetches them (#826): it reads them again when its
  // content changes. The observer stays on the host when it moves, and goes with it.
  private updateItems = (): void => {
    this.hasItems =
      this.hostElement.querySelectorAll('[slot="item"], mds-price-table-list-item').length > 0;
  };

  componentWillLoad(): void {
    this.updateItems();
    observeChildren(this.hostElement, this.updateItems);
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class="header" part="header">
          <slot name="header" />
        </div>
        {this.hasItems && <mds-separator class="separator"></mds-separator>}
        {/* a plain box: a <main> made every card one more main landmark, inside the page's */}
        {this.hasItems && (
          <div class="main" part="content">
            <slot name="item" />
          </div>
        )}
        <div class="footer" part="footer">
          <slot name="price" />
          <slot name="action" />
        </div>
      </Host>
    );
  }
}
