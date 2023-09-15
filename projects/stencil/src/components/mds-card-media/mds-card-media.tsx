import { Component, Host, h } from '@stencil/core'

/**
 * @slot default - Add `HTML elements` or `components` to this slot, it is **recommended** to add `mds-img` element or other component which represents media contents.
 * @slot content - Add `text string`, `HTML elements` or `components` to this slot, contents will be shown in front of the media element.
 */

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
