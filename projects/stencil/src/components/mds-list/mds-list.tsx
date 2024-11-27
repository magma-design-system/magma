import { Component, Host, h } from '@stencil/core'

/**
 * @slot default - Add `mds-list-item` element/s.
 */

@Component({
  tag: 'mds-list',
  styleUrl: 'mds-list.css',
  shadow: true,
})

export class MdsList {

  render () {
    return (
      <Host role="list">
        <slot></slot>
      </Host>
    )
  }

}
