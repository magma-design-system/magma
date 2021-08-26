import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-author',
  styleUrl: 'mds-author.css',
  shadow: true,
})
export class MdsAuthor {

  render () {
    return (
      <Host>
        <div class="avatar">
          <slot name="avatar"></slot>
        </div>
        <div class="info">
          <slot/>
        </div>
      </Host>
    )
  }

}
