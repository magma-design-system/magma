import { Component, Listen, Host, h, Prop } from '@stencil/core'

/**
 * @slot default - Put `mds-table-row` element/s.
 */

@Component({
  tag: 'mds-table-body',
  styleUrl: 'mds-table-body.css',
  shadow: true,
})
export class MdsTableBody {

  @Prop({ mutable: true, reflect: true }) interactive:boolean

  @Listen('mdsTableInteractiveChange', { target: 'document' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  render () {
    return (
      <Host role="rowgroup">
        <slot/>
      </Host>
    )
  }

}
