import { Component, Element, Host, h, Prop, State, Method, Watch } from '@stencil/core'
import { InputTipItemVariantType } from '@type/input-tip'
import miBaselineDone from '@icon/mi/baseline/done.svg'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
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
    el: localeEl,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.element)
  }

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
  @Prop({ reflect: true, mutable: true }) expanded?: boolean

  @Watch('expanded')
  handleEcpandedChanged (newValue: boolean): void {
    if (newValue === false) {
      this.expanded = undefined
    }
  }

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
            <span class="icon" innerHTML={miBaselineDone}></span>
          }

          { (this.variant === 'count-almost' || this.variant === 'count-almost-full' || this.variant === 'count-empty' || this.variant === 'count-full' || this.variant === 'count-incomplete') &&
            <mds-text typography="option" truncate="word">
              <span class="text"><slot/></span>
            </mds-text>
          }
        </div>
      </Host>
    )
  }
}
