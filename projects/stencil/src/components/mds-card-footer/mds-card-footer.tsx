import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-card-footer',
  styleUrl: 'mds-card-footer.css',
  shadow: true,
})
export class MdsCardFooter {

  /**
 * @slot default - Add contents here
 */

  render () {
    return (
      <Host slot="footer">
        <slot></slot>
      </Host>
    )
  }

}
