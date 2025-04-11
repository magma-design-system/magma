import { Component, Host, h, Prop, Element } from '@stencil/core'
import { AvatarSizeType } from './meta/types'

@Component({
  tag: 'mds-avatar-stack',
  styleUrl: 'mds-avatar-stack.css',
  shadow: true,
})
export class MdsAvatarStack {

  @Element() host: HTMLMdsAvatarStackElement
  private items: NodeListOf<HTMLMdsAvatarStackItemElement>

  /**
   * Specifies the size of the slotted avatars elements
   */
  @Prop({ reflect: true }) readonly size?: AvatarSizeType

  /**
   * Specifies the size of the slotted avatars elements
   */
  @Prop({ reflect: true }) readonly total?: number

  componentWillLoad (): void {
    this.items = this.host.querySelectorAll(':scope > mds-avatar-stack-item') as NodeListOf<HTMLMdsAvatarStackItemElement>
  }

  render () {
    return (
      <Host>
        <slot></slot>
        { this.total && this.total - this.items.length > 0 && <mds-avatar-stack-item count={this.total - this.items.length}></mds-avatar-stack-item> }
      </Host>
    )
  }
}
