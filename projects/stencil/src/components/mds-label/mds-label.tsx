import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mds-label',
  styleUrl: 'mds-label.css',
  shadow: true,
})
export class MdsLabel {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
