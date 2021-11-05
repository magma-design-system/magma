import { Component, Element, Host, Listen, State, h } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-flex-table-row',
  styleUrl: 'mds-flex-table-row.css',
  shadow: false,
})
export class MdsFlexTableRow {

  @Element() el: HTMLMdsFlexTableRowElement;

  /**
   * Specifies the template for flex children elements
   */
  @State() template?: string

  private setTemplate = () => {

    this.el.querySelectorAll('mds-flex-table-cell').forEach((element, index) => {
      const flexGrowTemplates: Array<string> = this.template.split(' ')
      /* eslint-disable dot-notation */
      element['flexGrow'] = flexGrowTemplates[index]
    })
  }

  @Listen('flexTableTemplateChanged', { target: 'body' })
  tableTemplateHandler (event: CustomEvent<string>): void {
    this.template = event.detail
    this.setTemplate()
  }

  @State() interactive?: boolean

  @Listen('flexTableInteractive', { target: 'body' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  render () {
    return (
      <Host class={clsx('flex-table-row', this.interactive && 'flex-table-row--interactive')} role="row">
        <slot/>
      </Host>
    )
  }

}
