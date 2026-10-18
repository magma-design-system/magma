import { Component, Element, Host, h, Prop, State } from '@stencil/core';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Add `mds-table-cell` element/s: the footer is itself a row, for totals and counts.
 */

@Component({
  tag: 'mds-table-footer',
  styleUrl: 'mds-table-footer.css',
  shadow: true,
})
export class MdsTableFooter {
  @Element() host: HTMLMdsTableFooterElement;
  @State() hasActions: boolean = false;

  /**
   * Adds an empty cell in the selection column, so that the cells of the footer line up with the
   * ones of the rows: `mds-table` sets it from its own `selectable`
   */
  @Prop() readonly selectable?: boolean;

  componentWillLoad(): void {
    // the rows with actions have a last column of their own, which the header labels: an empty
    // cell lines the footer up with it, as the selection cell does with the first column
    this.hasActions =
      this.host.closest('mds-table')?.querySelector('mds-table-row > [slot="action"]') != null;
  }

  render() {
    return (
      <Host role="row" pref-animation={preferenceStore.state.animation}>
        {this.selectable && <mds-table-cell class="selection"></mds-table-cell>}
        <slot />
        {this.hasActions && <mds-table-cell class="actions"></mds-table-cell>}
      </Host>
    );
  }
}
