import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-quote',
  styleUrl: 'mds-quote.css',
  shadow: true,
})
export class MdsQuote {

  render () {
    return (
      <Host>
        <div>
          <mds-icon name="format-quote-open"/>
          <mds-text typography="paragraph"><i><slot/></i></mds-text>
          <mds-icon name="quote"/>
        </div>
        <slot name="author"/>
      </Host>
    )
  }

}
