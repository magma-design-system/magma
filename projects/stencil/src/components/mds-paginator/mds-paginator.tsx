import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-paginator',
  styleUrl: 'mds-paginator.css',
  shadow: true,
})
export class MdsPaginator {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
