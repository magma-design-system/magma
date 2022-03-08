import { Component, Element, Host, Listen, State, h, Prop } from '@stencil/core'

@Component({
  tag: 'mds-flex-table-row',
  styleUrl: 'mds-flex-table-row.css',
  shadow: true,
})
export class MdsFlexTableRow {

  @Element() el: HTMLMdsFlexTableRowElement

  /**
   * Specifies the template for flex children elements
   */
  @State() template?: string
  @Prop({ mutable: true, reflect: true }) interactive?: boolean

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

  @Listen('flexTableInteractive', { target: 'body' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  render () {
    return (
      <Host role="row">
        <slot/>
      </Host>
    )
  }

}
