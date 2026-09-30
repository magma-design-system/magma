import { Component, Host, h, Prop } from '@stencil/core';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Put `mds-table-row` element/s.
 */

@Component({
  tag: 'mds-table-body',
  styleUrl: 'mds-table-body.css',
  shadow: true,
})
export class MdsTableBody {
  /**
   * Specifies whether the rows react to user interaction (hover/focus).
   */
  @Prop({ reflect: true }) readonly interactive?: boolean;
  /**
   * Enables the selection column for the rows in this table body.
   */
  @Prop({ reflect: true }) readonly selection?: boolean;

  render() {
    return (
      <Host role="rowgroup" pref-animation={preferenceStore.state.animation}>
        <slot />
      </Host>
    );
  }
}
