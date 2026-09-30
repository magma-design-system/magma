import { Component, Host, h, Element, State } from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import clsx from 'clsx';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot. Insert author information, name, role or other useful author infos.
 * @slot avatar - Insert an avatar image, it is **recommended** to add `mds-avatar` element.
 */
@Component({
  tag: 'mds-author',
  styleUrl: 'mds-author.css',
  shadow: true,
})
export class MdsAuthor {
  @State() hasAvatar: boolean;
  @Element() hostElement: HTMLMdsAuthorElement;

  private onAvatarSlotChange = (): void => {
    this.hasAvatar = hasChildWithSlot(this.hostElement, 'avatar');
  };

  componentWillLoad(): void {
    this.hasAvatar = hasChildWithSlot(this.hostElement, 'avatar');
  }

  render() {
    return (
      <Host>
        <div class={clsx('avatar', !this.hasAvatar && 'avatar--hidden')}>
          <slot name="avatar" onSlotchange={this.onAvatarSlotChange} />
        </div>
        <div class="info">
          <slot />
        </div>
      </Host>
    );
  }
}
