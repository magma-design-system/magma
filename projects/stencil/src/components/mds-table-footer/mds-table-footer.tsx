import { Component, Host, h } from '@stencil/core';
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
  render() {
    return (
      <Host role="row" pref-animation={preferenceStore.state.animation}>
        <slot />
      </Host>
    );
  }
}
