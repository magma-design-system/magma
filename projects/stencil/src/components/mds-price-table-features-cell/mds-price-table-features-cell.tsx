import { Component, Host, h, Prop } from '@stencil/core'
import { SupportedType } from './meta/types'
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg'
import miBaselineHorizontalRule from '@icon/mi/baseline/horizontal-rule.svg'

@Component({
  tag: 'mds-price-table-features-cell',
  styleUrl: 'mds-price-table-features-cell.css',
  shadow: true,
})
export class MdsPriceTableFeaturesCell {

  /**
   * Specifies the support type which is represented
   */
  @Prop({ reflect: true }) supported?: SupportedType = 'true'

  render () {
    return (
      <Host>
        { this.supported === 'true' &&
          <i class="svg icon icon--supported" innerHTML={miBaselineCheckCircle} part="icon"/>
        }
        { this.supported === 'false' &&
          <i class="svg icon icon--unsupported" innerHTML={miBaselineHorizontalRule} part="icon"/>
        }
        { this.supported === 'text' &&
          <mds-text part="text" typography="detail">
            <slot/>
          </mds-text>
        }
        { this.supported === 'custom' &&
          <slot/>
        }
      </Host>
    )
  }

}
