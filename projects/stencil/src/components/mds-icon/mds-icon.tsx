import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mds-icon',
  styleUrl: 'mds-icon.css',
  shadow: true,
})
export class MdsIcon {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
