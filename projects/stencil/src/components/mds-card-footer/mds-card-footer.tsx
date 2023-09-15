import { Component, Host, h } from '@stencil/core'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-card-footer',
  styleUrl: 'mds-card-footer.css',
  shadow: true,
})
export class MdsCardFooter {

  render () {
    return (
      <Host slot="footer">
        <slot></slot>
      </Host>
    )
  }

}
