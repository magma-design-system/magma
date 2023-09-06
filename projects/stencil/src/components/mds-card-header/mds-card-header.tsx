import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-card-header',
  styleUrl: 'mds-card-header.css',
  shadow: true,
})
export class MdsCardHeader {

  render () {
    return (
      <Host slot="header">
        <slot/>
      </Host>
    )
  }

}
