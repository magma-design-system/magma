import { Component, Host, h, Prop, Element } from '@stencil/core';
import { queryChildrenByTag } from '@common/slot';
import { AvatarSizeType } from './meta/types';

/**
 * @slot - Add `mds-avatar-stack-item` elements to display in the stack.
 */
@Component({
  tag: 'mds-avatar-stack',
  styleUrl: 'mds-avatar-stack.css',
  shadow: true,
})
export class MdsAvatarStack {
  @Element() host: HTMLMdsAvatarStackElement;
  private items: HTMLMdsAvatarStackItemElement[];

  /**
   * Specifies the size of the slotted avatars elements
   */
  @Prop({ reflect: true }) readonly size?: AvatarSizeType;

  /**
   * Specifies the size of the slotted avatars elements
   */
  @Prop({ reflect: true }) readonly total?: number;

  componentWillLoad(): void {
    this.items = queryChildrenByTag(
      this.host,
      'mds-avatar-stack-item',
    ) as HTMLMdsAvatarStackItemElement[];
  }

  render() {
    return (
      <Host>
        <slot></slot>
        {this.total !== undefined && this.total - this.items.length > 0 && (
          <mds-avatar-stack-item count={this.total - this.items.length}></mds-avatar-stack-item>
        )}
      </Host>
    );
  }
}
