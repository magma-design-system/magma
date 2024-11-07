import { Component, Host, h, Prop } from '@stencil/core'
import { PriceTableFeaturesCellType } from './meta/types'
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg'
import miBaselineHorizontalRule from '@icon/mi/baseline/horizontal-rule.svg'

/**
 * @part icon - Selects the HTML element of the icon when `type` attribute when is `supported` or `unsupported`.
 * @part text - Selects the HTML element wrapper of text when `type` attribute when is `text`.
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-price-table-features-cell',
  styleUrl: 'mds-price-table-features-cell.css',
  shadow: true,
})
export class MdsPriceTableFeaturesCell {

  /**
   * Specifies the support type which is represented
   */
  @Prop({ reflect: true }) type?: PriceTableFeaturesCellType = 'text'

  render () {
    return (
      <Host>
        { this.type === 'supported' &&
          <i class="icon icon--supported" innerHTML={miBaselineCheckCircle} part="icon"/>
        }
        { this.type === 'unsupported' &&
          <i class="icon icon--unsupported" innerHTML={miBaselineHorizontalRule} part="icon"/>
        }
        { this.type === 'text' &&
          <mds-text part="text" typography="detail">
            <slot/>
          </mds-text>
        }
        { this.type === 'custom' &&
          <slot/>
        }
        { this.type === 'label' &&
          <slot/>
        }
      </Host>
    )
  }

}
