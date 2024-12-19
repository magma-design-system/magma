import { Component, Host, h, Prop } from '@stencil/core'

/**
 * @slot default - Put `mds-table-row` element/s.
 */

@Component({
  tag: 'mds-table-body',
  styleUrl: 'mds-table-body.css',
  shadow: true,
})
export class MdsTableBody {

  @Prop({ reflect: true }) readonly interactive?: boolean
  @Prop({ reflect: true }) readonly selection?: boolean

  render () {
    return (
      <Host role="rowgroup">
        <slot/>
      </Host>
    )
  }

}
