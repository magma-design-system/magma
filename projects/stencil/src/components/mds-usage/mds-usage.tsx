import { Component, Element, Host, h, Prop, State, Method } from '@stencil/core'
import { UsageType } from './meta/types'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-usage',
  styleUrl: 'mds-usage.css',
  shadow: true,
})
export class MdsUsage {

  @Element() element: HTMLMdsUsageElement

  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.element)
  }

  /**
   * Specifies the delay when the tooltip will trigger
   */
  @Prop() readonly variant: UsageType = 'info'

  /**
   * Specifies the alias of the usage phrase on the top of the component
   */
  @Prop() readonly alias?: string

  render () {
    return (
      <Host>
        <mds-badge class="badge">{ this.alias ?? this.t.get(this.variant) }</mds-badge>
        <div class="content" role={ this.variant === 'do' || this.variant === 'info' ? 'insertion' : 'deletion'}>
          <slot/>
        </div>
      </Host>
    )
  }
}
