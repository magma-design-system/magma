import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table',
  styleUrl: 'mds-table.css',
  shadow: true,
})
export class MdsTable {

  render () {
    return (
      <Host>
        <table class="table" role="grid">
          <slot></slot>
        </table>
      </Host>
    )
  }
}
