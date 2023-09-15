import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-list',
  styleUrl: 'mds-list.css',
  shadow: true,
})

export class MdsList {


  /**
 * @slot default - Put mds-list-item here
 */

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
