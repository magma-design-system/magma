import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-input-switch-group',
  styleUrl: 'mds-input-switch-group.css',
  shadow: true,
})
export class MdsInputSwitchGroup {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
