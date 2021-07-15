import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-card',
  styleUrl: 'mds-card.css',
  shadow: true,
})
export class MdsCard {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
