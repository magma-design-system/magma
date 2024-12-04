import { Component, Host, h, Listen, Prop, Element } from '@stencil/core'
import { isMobileDevice } from '@common/device'
import clsx from 'clsx'

/**
 * @slot default - Put `mds-table-cell` element/s.
 */

@Component({
  tag: 'mds-table-row',
  styleUrl: 'mds-table-row.css',
  shadow: true,
})
export class MdsTableRow {

  @Element() host: HTMLMdsTableRowElement
  private actions: boolean

  @Prop({ mutable: true, reflect: true }) interactive: boolean

  @Prop({ mutable: true, reflect: true }) overlayActions: boolean

  @Listen('mdsTableInteractiveChange', { target: 'document' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  componentWillLoad (): void {
    this.actions = this.host.querySelector('[slot="action"]') !== null
  }

  render () {
    return (
      <Host role="row">
        <slot/>
        { this.actions
          && <div class={clsx('actions-wrapper', isMobileDevice() && 'actions-wrapper--mobile')} role="cell">
            <div class="actions">
              <slot name="action"></slot>
            </div>
          </div>
        }
      </Host>
    )
  }

}
