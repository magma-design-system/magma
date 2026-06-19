import { Component, Host, h, Prop, Method, Element, State } from '@stencil/core';
// import mggAiBrain from '@icon/mgg/ai-brain.svg'
import mggAiChatbot from '@icon/mgg/ai-chatbot.svg';
import miOutlinePolicy from '@icon/mi/outline/policy.svg';
import { PolicyAiVariant } from './meta/types';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @part icon - Selects the `icon` component wrapped in shadowDOM, will be found only if attirbute `variant` is set to `icon`.
 * @part chip - Selects the `chip` component wrapped in shadowDOM, will be found only if attirbute `variant` is set to `chip`.
 * @part card - Selects the `card` component wrapped in shadowDOM, will be found only if attirbute `variant` is set to `card`.
 * @part banner - Selects the `banner` component wrapped in shadowDOM, will be found only if attirbute `variant` is set to `banner`.
 */

@Component({
  tag: 'mds-policy-ai',
  styleUrl: 'mds-policy-ai.css',
  shadow: true,
})
export class MdsPolicyAi {
  @Element() host: HTMLMdsPolicyAiElement;

  @State() language: string;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  /**
   * Updates the component's texts to the locale currently set on the host element.
   */
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.host);
    this.t.update();
  }

  /**
   * Sets the headline to custom component text
   */
  @Prop({ reflect: true }) headline?: string;

  /**
   * Sets the description to custom component long text
   */
  @Prop({ reflect: true }) description?: string;

  /**
   * Sets the variant type of the component
   */
  @Prop({ reflect: true }) variant?: PolicyAiVariant = 'chip';

  /**
   * Sets the pointing URL of the component
   */
  @Prop({ reflect: true }) href?: string =
    'https://www.maggiolieditore.it/il-regolamento-europeo-sull-intelligenza-artificiale.html';

  componentWillLoad(): void {
    this.language = this.t.lang(this.host);
  }

  render() {
    return (
      <Host>
        {this.variant === 'icon' && (
          <mds-help
            icon={mggAiChatbot}
            class="icon-help"
            onClick={() => window.open(this.href, '_blank')}
            part="icon"
          >
            <div class="icon-tip-content">
              <mds-text typography="tip">{this.headline ?? this.t.get('iconTooltip')}</mds-text>
              <mds-text typography="tip">
                {this.description ?? this.t.get('iconLinkLabel')}
              </mds-text>
            </div>
          </mds-help>
        )}
        {this.variant === 'chip' && (
          <div class="chip-wrapper" part="chip">
            <mds-chip
              id="chip"
              icon={mggAiChatbot}
              class="chip"
              variant="ai"
              label={this.headline ?? this.t.get('chipLabel')}
            ></mds-chip>
            <mds-dropdown target="#chip" class="chip-dropdown" interaction="mouseover">
              <mds-text typography="tip">
                {this.description ?? this.t.get('cardDescription')}
              </mds-text>
              <mds-button
                icon={miOutlinePolicy}
                href={this.href}
                variant="ai"
                tone="weak"
                size="sm"
              >
                {this.t.get('linkLabel')}
              </mds-button>
            </mds-dropdown>
          </div>
        )}
        {this.variant === 'card' && (
          <div class="mini-card" part="card">
            <mds-icon name={mggAiChatbot} class="mini-card-icon"></mds-icon>
            <div class="mini-card-content">
              <mds-text typography="caption">
                {this.description ?? this.t.get('iconTooltip')}
              </mds-text>
              <mds-button
                class="mini-card-button"
                icon={miOutlinePolicy}
                href={this.href}
                variant="ai"
                tone="weak"
                size="sm"
              >
                <span class="link-label-long">{this.t.get('linkLabel')}</span>
                <span class="link-label-short">{this.t.get('linkLabelShort')}</span>
              </mds-button>
            </div>
          </div>
        )}
        {this.variant === 'banner' && (
          <mds-banner
            class="banner"
            variant="ai"
            tone="weak"
            icon={mggAiChatbot}
            headline={this.headline ?? this.t.get('bannerTitle')}
            part="banner"
          >
            <mds-text typography="caption">
              {this.description ?? this.t.get('bannerDescription')}
            </mds-text>
            <mds-button
              icon={miOutlinePolicy}
              slot="action"
              href={this.href}
              variant="ai"
              tone="weak"
              size="sm"
            >
              <span class="link-label-long">{this.t.get('linkLabel')}</span>
              <span class="link-label-short">{this.t.get('linkLabelShort')}</span>
            </mds-button>
          </mds-banner>
        )}
      </Host>
    );
  }
}
