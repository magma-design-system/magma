import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-card-media',
  styleUrl: 'mds-card-media.css',
  shadow: true,
})
export class MdsCardMedia {

  /**
 * @slot default - Add mds-img or other kind of media elemnts here
 * @slot content - Add contents here, which will be shown in front of the media element
 */

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
