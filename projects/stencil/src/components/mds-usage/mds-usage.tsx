import { Component, Host, h, Prop } from '@stencil/core';
import { UsageType } from './meta/types';
import { usageVariantIcon } from './meta/variants';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 * @part header - The header that holds the `icon` and the `label`
 * @part icon - The icon of the header, the one of `variant` unless `icon` is set
 * @part label - The label of the header, the name of `variant` unless `alias` is set
 */

@Component({
  tag: 'mds-usage',
  styleUrl: 'mds-usage.css',
  shadow: true,
})
export class MdsUsage {
  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Specifies the guidance category of the content, which drives colors, header label and icon
   */
  @Prop({ reflect: true }) readonly variant: UsageType = 'info';

  /**
   * Specifies the alias of the usage phrase on the top of the component
   */
  @Prop() readonly alias?: string;

  /**
   * Specifies the icon displayed in the header; when not set or empty, the icon follows the `variant`
   */
  @Prop() readonly icon?: string;

  render() {
    // an unknown variant gets the info icon, as it gets the info styling
    const icon = this.icon || (usageVariantIcon[this.variant] ?? usageVariantIcon.info);

    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class="header" part="header">
          <mds-icon name={icon} part="icon" />
          <mds-text typography="label" class="label" part="label">
            {this.alias ?? this.t.get(this.variant)}
          </mds-text>
        </div>
        {/* no role: insertion and deletion are the marks of a document edit, and a screen
         * reader announced the guidance as text added or removed. The label above says what
         * kind of guidance it is */}
        <div class="content">
          <slot />
        </div>
      </Host>
    );
  }
}
