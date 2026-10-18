import miBaselineCancel from '@icon/mi/baseline/cancel.svg';
import { Component, Event, EventEmitter, Host, h, Prop } from '@stencil/core';
import { ThemeLabelVariantType, ThemeStatusVariantType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';

import { TypographyTooltipType } from '@type/typography';
import { TypographyTruncateType } from '@type/text';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

export type MdsLabelVariantType = ThemeLabelVariantType | ThemeStatusVariantType;

@Component({
  tag: 'mds-label',
  styleUrl: 'mds-label.css',
  shadow: true,
})
export class MdsLabel {
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * The label of the component
   */
  @Prop({ reflect: true }) readonly label?: string;

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant: MdsLabelVariantType = 'sky';

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone: ToneMinimalVariantType = 'weak';

  /**
   * Truncates text inside the label or displays it in multiline if needed
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType = 'word';

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographyTooltipType = 'caption';

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable: boolean = false;

  private onClickDelete = (ev: Event) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.deletedEvent.emit();
  };

  /**
   * Emits when the label has to be cancelled
   */
  @Event({ eventName: 'mdsLabelDelete' }) deletedEvent: EventEmitter<void>;

  render() {
    return (
      <Host
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <mds-text class="text" truncate={this.truncate} typography={this.typography}>
          {this.label}
        </mds-text>
        {/* mds-button takes Enter on its own: the label adds no keyboard handling to it */}
        {this.deletable && (
          <mds-button
            class="button-close"
            icon={miBaselineCancel}
            onClick={this.onClickDelete}
            title={this.t.get('remove')}
            size="sm"
          ></mds-button>
        )}
      </Host>
    );
  }
}
