import { Component, Element, Host, h, Prop } from '@stencil/core'

@Component({
  tag: 'mds-flex-table-body',
  styleUrl: 'mds-flex-table-body.css',
  shadow: false,
})
export class MdsFlexTableBody {

  @Element() el: HTMLMdsFlexTableBodyElement;

  /**
   * Specifies the template grid to use with table grid's elements
   */
  @Prop() readonly template?: string

  componentWillLoad (): void {
    this.el.childNodes.forEach(element => {
      /* eslint-disable dot-notation */
      if (element['template'] === undefined) {
        element['template'] = this.template
      }
    })
  }

  render () {
    return (
      <Host role="rowgroup">
        <slot></slot>
      </Host>
    )
  }

}
