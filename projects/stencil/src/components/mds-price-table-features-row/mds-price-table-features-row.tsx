import { Component, Host, h, Element, Prop, State } from '@stencil/core'

@Component({
  tag: 'mds-price-table-features-row',
  styleUrl: 'mds-price-table-features-row.css',
  shadow: true,
})
export class MdsPriceTableFeaturesRow {

  private horizontalCells: NodeListOf<HTMLMdsPriceTableFeaturesCellElement>
  @State() cellPercWidth: string
  @Element() host: HTMLMdsPriceTableFeaturesRowElement

  /**
   * Sets an horizontal title for the feature row
   */
  @Prop() readonly label?: string


  componentDidRender (): void {
    this.horizontalCells = this.host.querySelectorAll('mds-price-table-features-cell')
    this.cellPercWidth = Number(100 / (this.horizontalCells.length + 1)).toFixed(4) + '%'
    this.horizontalCells.forEach((el: HTMLMdsPriceTableFeaturesCellElement) => {
      el.style.width = this.cellPercWidth
    })
  }

  render () {
    return (
      <Host>
        { this.label &&
        <mds-price-table-features-cell supported="custom" style={{ width: this.cellPercWidth }}>
          <mds-text class="text" typography="detail">
            { this.label }
          </mds-text>
        </mds-price-table-features-cell>
        }
        <slot/>
      </Host>
    )
  }

}
