import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-footer',
  styleUrl: 'mds-table-footer.css',
  shadow: false,
})
export class MdsTableFooter {

  render () {
    return (
      <Host class="table-footer">
        <slot></slot>
      </Host>
    )
  }

}
