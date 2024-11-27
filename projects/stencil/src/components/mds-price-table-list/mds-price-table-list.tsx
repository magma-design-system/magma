import { Component, Host, h, Element, State } from '@stencil/core'

/**
 * @part content - Selects the element which wraps elements added via `default slot`
 * @part footer - Selects the element which wraps elements added via `slot="price"` and `slot="action"`
 * @part header - Selects the element which wraps elements added via `slot="header"`
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot default - Add `mds-price-table-list-item` component, `HTML elements` or other `components` to this slot.
 * @slot header - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot price - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-price-table-list',
  styleUrl: 'mds-price-table-list.css',
  shadow: true,
})
export class MdsPriceTableList {

  @State() hasItems: boolean
  @Element() hostElement: HTMLMdsPriceTableListElement

  componentWillLoad (): void {
    this.hasItems = this.hostElement.querySelectorAll('[slot="item"], mds-price-table-list-item').length > 0
  }

  render () {
    return (
      <Host>
        <div class="header" part="header">
          <slot name="header"/>
        </div>
        { this.hasItems && <mds-separator class="separator"></mds-separator> }
        { this.hasItems &&
          <main class="main" part="content">
            <slot name="item"/>
          </main>
        }
        <div class="footer" part="footer">
          <slot name="price"/>
          <slot name="action"/>
        </div>
      </Host>
    )
  }

}
