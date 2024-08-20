import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-pref',
  styleUrl: 'mds-pref.css',
  shadow: true,
})
export class MdsPref {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
