import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-list',
  styleUrl: 'mds-list.css',
  shadow: true,
})

export class MdsList {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
