import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-keyboard-key',
  styleUrl: 'mds-keyboard-key.css',
  shadow: true,
})
export class MdsKeyboardKey {
  render () {
    return (
      <Host>
        <mds-text class="shortcut-text" typography="detail"><b><slot/></b></mds-text>
      </Host>
    )
  }
}
