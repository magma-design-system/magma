import { Component, Host, h, Listen, Prop, Element } from '@stencil/core'
// import { isMobileDevice } from '@common/device'
// import clsx from 'clsx'

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
  private actions: HTMLDivElement
  private hasActions: boolean
  private sizerWidth: string

  @Prop({ mutable: true, reflect: true }) interactive: boolean

  @Prop({ mutable: true, reflect: true }) overlayActions: boolean

  @Listen('mdsTableInteractiveChange', { target: 'document' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  componentWillLoad (): void {
    this.hasActions = this.host.querySelector('[slot="action"]') !== null
  }

  componentDidLoad (): void {
    if (this.hasActions) {
      this.actions = this.host.shadowRoot?.querySelector('.actions') as HTMLDivElement
      this.sizerWidth = `${this.actions.offsetWidth.toString()}px`
    }
  }

  render () {
    return (
      <Host role="row">
        <slot/>
        { this.hasActions &&
          <mds-table-cell class="actions-cell">
            <div class="actions-sizer" style={{
              minHeight: '1px',
              minWidth: this.sizerWidth,
            }}></div>
            <div class="actions-view">
              <div class="actions" style={{
                marginRight: `calc(${this.sizerWidth} + var(--mds-table-cell-padding))`,
              }}>
                <slot name="action"></slot>
              </div>
            </div>
          </mds-table-cell>
        }
      </Host>
    )
  }

}
