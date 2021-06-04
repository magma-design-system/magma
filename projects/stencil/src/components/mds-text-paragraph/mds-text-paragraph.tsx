import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mds-text-paragraph',
  styleUrl: 'mds-text-paragraph.css',
  shadow: true,
})
export class MdsTextParagraph {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
