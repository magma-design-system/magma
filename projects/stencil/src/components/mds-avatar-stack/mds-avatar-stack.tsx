import { Component, Host, h, Prop, Element, State } from '@stencil/core';
import { queryChildrenByTag } from '@common/slot';
import { AvatarSizeType } from './meta/types';

/**
 * @slot - Add `mds-avatar-stack-item` elements to display in the stack.
 * @category data
 */
@Component({
  tag: 'mds-avatar-stack',
  styleUrl: 'mds-avatar-stack.css',
  shadow: true,
})
export class MdsAvatarStack {
  @Element() host: HTMLMdsAvatarStackElement;
  // the avatars in the stack, counted again whenever they change: the overflow item shows the
  // ones `total` has beyond them, and avatars added after load used to be left out (#826)
  @State() private itemsCount = 0;

  /**
   * Specifies the size of the slotted avatars elements
   */
  @Prop({ reflect: true }) readonly size?: AvatarSizeType;

  /**
   * Specifies the size of the slotted avatars elements
   */
  @Prop({ reflect: true }) readonly total?: number;

  private updateItems = (): void => {
    this.itemsCount = queryChildrenByTag(this.host, 'mds-avatar-stack-item').length;
  };

  componentWillLoad(): void {
    this.updateItems();
  }

  render() {
    return (
      <Host>
        <slot onSlotchange={this.updateItems}></slot>
        {this.total !== undefined && this.total - this.itemsCount > 0 && (
          <mds-avatar-stack-item count={this.total - this.itemsCount}></mds-avatar-stack-item>
        )}
      </Host>
    );
  }
}
