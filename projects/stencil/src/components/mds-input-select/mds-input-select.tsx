import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-input-select',
  styleUrl: 'mds-input-select.css',
  shadow: true,
})
export class MdsInputSelect {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
