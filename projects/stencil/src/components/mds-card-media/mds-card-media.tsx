import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-card-media',
  styleUrl: 'mds-card-media.css',
  shadow: true,
})
export class MdsCardMedia {

  render () {
    return (
      <Host slot="media">
        <div class="content" part="content">
          <slot name="content"/>
        </div>
        <slot/>
      </Host>
    )
  }

}
