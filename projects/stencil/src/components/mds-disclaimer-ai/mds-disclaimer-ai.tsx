import { Component, Host, h, Prop, Method, Element, State } from '@stencil/core'
import mggAiBrain from '@icon/mgg/ai-brain.svg'
import miOutlinePolicy from '@icon/mi/outline/policy.svg'
import { DisclaimerAiVariant } from './meta/types'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

@Component({
  tag: 'mds-disclaimer-ai',
  styleUrl: 'mds-disclaimer-ai.css',
  shadow: true,
})
export class MdsDisclaimerAi {
  @Element() host: HTMLMdsDisclaimerAiElement

  @State() language: string
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
    this.t.update()
  }

  @Prop({ reflect: true }) variant?: DisclaimerAiVariant = 'chip'
  @Prop({ reflect: true }) href?: string = 'https://www.maggiolieditore.it/il-regolamento-europeo-sull-intelligenza-artificiale.html'

  componentWillLoad (): void {
    this.language = this.t.lang(this.host)
  }

  render () {
    return (
      <Host>
        { this.variant === 'icon' && (
          <mds-help icon={mggAiBrain} class="icon-help" onClick={() => window.open(this.href, '_blank')}>
            <div class="icon-tip-content">
              <mds-text typography="tip">{ this.t.get('iconTooltip') }</mds-text>
              <mds-text typography="tip">{ this.t.get('iconLinkLabel') }</mds-text>
            </div>
          </mds-help>
        )}
        { this.variant === 'chip' && (
          <div class="chip-wrapper">
            <mds-chip id="chip" icon={mggAiBrain} class="chip" variant="ai" label={ this.t.get('chipLabel') }></mds-chip>
            <mds-dropdown target="#chip" class="chip-dropdown" interaction="mouseover">
              <mds-text typography="tip">{ this.t.get('cardDescription') }</mds-text>
              <mds-button icon={miOutlinePolicy} href={this.href} variant="ai" tone="weak" size="sm">{ this.t.get('linkLabel') }</mds-button>
            </mds-dropdown>
          </div>
        )}
        { this.variant === 'card' && (
          <div class="mini-card">
            <mds-icon name={mggAiBrain} class="mini-card-icon"></mds-icon>
            <div class="mini-card-content">
              <mds-text typography="tip">{ this.t.get('iconTooltip') }</mds-text>
              <mds-button class="mini-card-button" icon={miOutlinePolicy} href={this.href} variant="ai" tone="weak" size="sm">
                <span class="link-label-long">{ this.t.get('linkLabel') }</span>
                <span class="link-label-short">{ this.t.get('linkLabelShort') }</span>
              </mds-button>
            </div>
          </div>
        )}
        { this.variant === 'banner' && (
          <mds-banner variant="ai" tone="weak" icon={mggAiBrain} headline={ this.t.get('bannerTitle') }>
            <mds-text typography="caption">{ this.t.get('bannerDescription') }</mds-text>
            <mds-button icon={miOutlinePolicy} slot="action" href={this.href} variant="ai" tone="weak" size="sm">
              <span class="link-label-long">{ this.t.get('linkLabel') }</span>
              <span class="link-label-short">{ this.t.get('linkLabelShort') }</span>
            </mds-button>
          </mds-banner>
        )}
      </Host>
    )
  }
}
