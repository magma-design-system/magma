import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-mention',
  styleUrl: 'mds-mention.css',
  shadow: true,
})
export class MdsMention {
  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
