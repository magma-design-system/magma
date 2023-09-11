import { Component, Host, h, Element } from '@stencil/core'

@Component({
  tag: 'mds-card-header',
  styleUrl: 'mds-card-header.css',
  shadow: true,
})
export class MdsCardHeader {

  @Element() private hostElement: HTMLMdsCardElement
  private actions: boolean

  componentWillLoad (): void {
    this.actions = this.hostElement.querySelector('[slot="action"]') !== null
  }

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
