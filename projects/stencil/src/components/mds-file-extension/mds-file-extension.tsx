import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-file-extension',
  styleUrl: 'mds-file-extension.css',
  shadow: true,
})
export class MdsFileExtension {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
