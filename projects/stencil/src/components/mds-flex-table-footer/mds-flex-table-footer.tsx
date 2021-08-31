import { Component, Element, Host, h, Prop } from '@stencil/core'

@Component({
  tag: 'mds-flex-table-footer',
  styleUrl: 'mds-flex-table-footer.css',
  shadow: false,
})
export class MdsFlexTableFooter {

  @Element() el: HTMLMdsFlexTableFooterElement;

  /**
   * Specifies the template for flex children elements
   */
  @Prop() readonly template?: string

  componentWillLoad (): void {
    this.el.childNodes.forEach((element, index) => {
      /* eslint-disable dot-notation */
      const flexGrowTemplates: Array<string> = this.template.split(' ')
      if (index > 0 && element['flexGrow'] === undefined) {
        console.log(flexGrowTemplates[index - 1])
        element['flexGrow'] = flexGrowTemplates[index - 1]
      }
    })
  }

  render () {
    return (
      <Host role="row">
        <slot></slot>
      </Host>
    )
  }

}
