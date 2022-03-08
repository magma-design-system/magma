import { Component, Element, Host, Listen, State, h } from '@stencil/core'

@Component({
  tag: 'mds-flex-table-header',
  styleUrl: 'mds-flex-table-header.css',
  shadow: true,
})
export class MdsFlexTableHeader {

  @Element() el: HTMLMdsFlexTableHeaderElement

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
  tableInteractiveHandler (event: CustomEvent<string>): void {
    this.template = event.detail
    this.setTemplate()
  }

  render () {
    return (
      <Host role="row">
        <slot/>
      </Host>
    )
  }

}
