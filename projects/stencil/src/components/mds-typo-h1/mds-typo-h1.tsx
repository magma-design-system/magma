import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mds-typo-h1',
  styleUrl: 'mds-typo-h1.css',
  shadow: true,
})
export class MdsTypoH1 {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
