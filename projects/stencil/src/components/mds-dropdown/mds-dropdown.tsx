import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-dropdown',
  styleUrl: 'mds-dropdown.css',
  shadow: true,
})
export class MdsDropdown {

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }
}
