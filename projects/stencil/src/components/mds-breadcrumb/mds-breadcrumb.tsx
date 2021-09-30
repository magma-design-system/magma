import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-breadcrumb',
  styleUrl: 'mds-breadcrumb.css',
  shadow: true,
})
export class MdsBreadcrumb {

  render () {
    return (
      <Host>
        <div class="back">
          <mds-icon name="arrow-back" />
        </div>
        <slot name="breadcrumb-item"/>
      </Host>
    )
  }

}
