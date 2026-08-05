import { Component, Host, h, Element } from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';

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
  private actions: boolean;

  componentWillLoad(): void {
    this.actions = hasChildWithSlot(this.hostElement, 'action');
  }

  render() {
    return (
      <Host slot="header">
        <slot />
        {this.actions && (
          <div class="actions">
            <slot name="action" />
          </div>
        )}
      </Host>
    );
  }
}
