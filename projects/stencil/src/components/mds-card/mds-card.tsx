import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-card',
  styleUrl: 'mds-card.css',
  shadow: true,
})
export class MdsCard {

  render () {
    return (
      <Host>
        {/* <div class="media" part="media">
          <slot name="media"/>
        </div>
        <div class="header" part="header">
          <slot name="header"/>
        </div>
        <div class="content" part="content">
          <slot/>
        </div>
        <div class="footer" part="footer">
          <slot name="footer"/>
        </div> */}

        <slot name="media"/>
        <slot name="header"/>
        <slot name="content"/>
        <slot name="footer"/>
      </Host>
    )
  }

}
