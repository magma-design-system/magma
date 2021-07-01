import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mds-h1',
  styleUrl: 'mds-h1.css',
  shadow: true,
})
export class MdsH1 {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
