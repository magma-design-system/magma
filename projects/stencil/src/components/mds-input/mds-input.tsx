import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'mds-input',
  styleUrl: 'mds-input.css',
  shadow: true,
})
export class MdsInput {

  @Prop() label?: string;
  @Prop() type?: string = 'text';

  render() {
    return (
      <Host>
        { this.label && <mds-h1>{this.label}</mds-h1> }
        <slot></slot>
      </Host>
    );
  }

}
