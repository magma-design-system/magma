import { Component, Host, h } from '@stencil/core';

/**
 * @slot - Add `mds-button` elements to this slot.
 */
@Component({
  tag: 'mds-button-group',
  styleUrl: 'mds-button-group.css',
  shadow: true,
})
export class MdsButtonGroup {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
