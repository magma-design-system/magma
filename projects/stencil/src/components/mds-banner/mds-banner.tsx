import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'mds-banner',
  styleUrl: 'mds-banner.css',
  shadow: true,
})
export class MdsBanner {

  @Prop() variant: string = 'pippo' || 'pluto';

  render() {
    return (
      <Host class={`${this.variant}`}>
        <slot></slot>
      </Host>
    );
  }
}
