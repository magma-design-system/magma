import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyReadType } from '@type/typography'
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg'
import miBaselineHorizontalRule from '@icon/mi/baseline/horizontal-rule.svg'

@Component({
  tag: 'mds-price-table-list-item',
  styleUrl: 'mds-price-table-list-item.css',
  shadow: true,
})
export class MdsPriceTableListItem {

  /**
 * Specifies if the feature is supported or not
 */
  @Prop({ reflect: true }) readonly supported: boolean = false

  /**
 * Specifies if the feature is supported or not
 */
  @Prop({ reflect: true }) readonly typography: TypographyReadType = 'detail'

  render () {
    return (
      <Host slot="item">
        <mds-text class="icon-container" typography={this.typography}>
          { this.supported
            ? <i class="icon" innerHTML={miBaselineCheckCircle} part="icon" />
            : <i class="icon" innerHTML={miBaselineHorizontalRule} part="icon" />
          }
        </mds-text>
        <mds-text class="text" typography={this.typography}>
          <slot/>
        </mds-text>
      </Host>
    )
  }

}
