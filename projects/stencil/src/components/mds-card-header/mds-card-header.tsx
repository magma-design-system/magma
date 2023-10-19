import { Component, Host, h, Element } from '@stencil/core'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 */

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
