import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-pref-animation',
  styleUrl: 'mds-pref-animation.css',
  shadow: true,
})
export class MdsPrefAnimation {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
