import { Component, Host, h, Element } from '@stencil/core'

@Component({
  tag: 'mds-card-header',
  styleUrl: 'mds-card-header.css',
  shadow: true,
})
export class MdsCardHeader {

  @Element() private hostElement: HTMLMdsCardHeaderElement
  private actions: boolean

  componentWillLoad (): void {
    this.actions = this.hostElement.querySelector('[slot="action"]') !== null
  }

  /**
 * @slot default - Add contents here
 * @slot action - Add actions elements here
 */

  render () {
    return (
      <Host slot="header">
        <slot/>
        { this.actions && <div class="actions">
          <slot name="action"/>
        </div> }
      </Host>
    )
  }

}
