import { Component, Host, h, Prop } from '@stencil/core'

/**
 * @part header - Selects the HTML element wrapper of label text
 * @slot default - Expects to slot `mds-price-table-features-row` component
 */

@Component({
  tag: 'mds-price-table-features',
  styleUrl: 'mds-price-table-features.css',
  shadow: true,
})
export class MdsPriceTableFeatures {

  /**
   * Sets a header title for the entire table
   */
  @Prop() readonly label?: string

  render () {
    return (
      <Host>
        <div class="table-wrapper">
          { this.label &&
          <header part="header">
            <mds-text typography="detail">
              <b>{ this.label }</b>
            </mds-text>
          </header>
          }
          <table>
            <tbody>
              <slot/>
            </tbody>
          </table>
        </div>
      </Host>
    )
  }
}
