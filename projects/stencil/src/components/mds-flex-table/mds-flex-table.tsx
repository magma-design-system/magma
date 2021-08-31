import { Component, Element, Host, h, Prop } from '@stencil/core'

@Component({
  tag: 'mds-flex-table',
  styleUrl: 'mds-flex-table.css',
  shadow: true,
})
export class MdsFlexTable {

  @Element() el: HTMLMdsFlexTableElement;

  /**
   * Specifies the template for flex children elements
   */
  @Prop() readonly template?: string

  componentWillLoad (): void {
    this.el.childNodes.forEach(element => {
      /* eslint-disable dot-notation */
      console.log('HTMLMdsFlexTableElement', `"${this.template}"`)
      if (element['template'] === undefined) {
        element['template'] = this.template
      }
    })
  }

  render () {
    return (
      <Host>
        <div class="flex-table" role="grid">
          <slot/>
        </div>
      </Host>
    )
  }

}
