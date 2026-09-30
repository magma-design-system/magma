import { Component, Host, h, Element, State } from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import clsx from 'clsx';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 */

@Component({
  tag: 'mds-card-header',
  styleUrl: 'mds-card-header.css',
  shadow: true,
})
export class MdsCardHeader {
  @Element() private hostElement: HTMLMdsCardHeaderElement;
  @State() hasActions: boolean;

  private onActionSlotChange = (): void => {
    this.hasActions = hasChildWithSlot(this.hostElement, 'action');
  };

  componentWillLoad(): void {
    this.hasActions = hasChildWithSlot(this.hostElement, 'action');
  }

  render() {
    return (
      <Host slot="header">
        <slot />
        <div class={clsx('actions', !this.hasActions && 'actions--hidden')}>
          <slot name="action" onSlotchange={this.onActionSlotChange} />
        </div>
      </Host>
    );
  }
}
