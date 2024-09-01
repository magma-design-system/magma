import { Component, Element, Host, h, Prop } from '@stencil/core'
import { InputTipItemVariantType } from '@component/mds-input-tip-item/meta/types'
import miBaselineDone from '@icon/mi/baseline/done.svg'
import { Locale } from '@common/locale'
import localeEn from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'

@Component({
  tag: 'mds-input-tip-item',
  styleUrl: 'mds-input-tip-item.css',
  shadow: true,
})
export class MdsInputTipItem {
  @Element() private element: HTMLMdsInputTipItemElement

  private t:Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  /**
   * Specifies the variant of the element
   */
  @Prop({ reflect: true }) readonly variant?: InputTipItemVariantType = 'required'

  /**
   * Specifies if the element is expanded
   */
  @Prop({ reflect: true }) readonly expanded?: boolean = true

  render () {
    return (
      <Host>
        <div class="content">
          { this.variant === 'text' &&
            <mds-text typography="option" truncate="word">
              <span class="text"><slot/></span>
            </mds-text>
          }
          { this.variant === 'readonly' &&
            <mds-text typography="option" truncate="word">
              <span class="text">{this.variant && this.t.get(this.variant.toString())}</span>
            </mds-text>
          }
          { this.variant === 'disabled' &&
            <mds-text typography="option" truncate="word">
              <span class="text">{ this.variant && this.t.get(this.variant.toString()) }</span>
            </mds-text>
          }
          { this.variant === 'required' &&
            <mds-text typography="option" truncate="word">
              <span class="text">{this.variant && this.t.get(this.variant.toString())}</span>
            </mds-text>
          }
          { this.variant === 'required-success' &&
            <span class="icon svg" innerHTML={miBaselineDone}></span>
          }
        </div>
      </Host>
    )
  }
}
