import { Component, Host, h, Prop } from '@stencil/core';
import { UsageType } from './meta/types';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
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
   * Specifies the delay when the tooltip will trigger
   */
  @Prop() readonly variant: UsageType = 'info';

  /**
   * Specifies the alias of the usage phrase on the top of the component
   */
  @Prop() readonly alias?: string;

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class="header" part="header">
          <mds-icon name="mi/baseline/info" part="icon" />
          <mds-text typography="label" class="label" part="label">
            {this.alias ?? this.t.get(this.variant)}
          </mds-text>
        </div>
        <div
          class="content"
          role={this.variant === 'do' || this.variant === 'info' ? 'insertion' : 'deletion'}
        >
          <slot />
        </div>
      </Host>
    );
  }
}
