import { Component, Host, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import { Locale } from '@common/locale';
import localeDefault from './meta/locale.json';
import localeIt from './meta/locale.it.json';
import localeEn from './meta/locale.en.json';
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg';
import miOutlineCircle from '@icon/mi/outline/circle.svg';
import { MdsPrefLanguageEventDetail } from '@event/language';

@Component({
  tag: 'mds-pref-language-item',
  styleUrl: 'mds-pref-language-item.css',
  shadow: true,
})
export class MdsPrefLanguageItem {
  private readonly t: Locale = new Locale({
    en: localeEn,
    it: localeIt,
  });

  /**
   * Specifies the language code based on HTML `lang` attribute
   */
  @Prop({ reflect: true }) readonly code: string;

  /**
   * Specifies if the element is selected
   */
  @Prop({ reflect: true }) readonly selected?: boolean = false;

  /**
   * Emits when the component trigger the language
   */
  @Event({ eventName: 'mdsPrefLanguageItemSelect' })
  selectLanguageEvent: EventEmitter<MdsPrefLanguageEventDetail>;

  componentWillLoad(): void {
    this.validateCode(this.code);
  }

  @Watch('code')
  handleCodeChange(newValue: string): void {
    this.validateCode(newValue);
  }

  // `code` is assigned asynchronously by framework wrappers (e.g. @lit/react sets it
  // as a property after the element connects), so it is briefly undefined on the first
  // render pass and the watcher re-validates once it lands. Only a non-empty,
  // unrecognized code is a real error; empty codes fall back to the `noCode` branch
  // already handled in render().
  private readonly validateCode = (code: string): void => {
    if (code && !localeDefault[code]) {
      throw Error(`Language code not found: ${code}`);
    }
  };

  private handleClick = (): void => {
    this.selectLanguageEvent.emit({ language: this.code });
  };

  render() {
    return (
      <Host onClick={this.handleClick}>
        {this.code !== '' ? (
          <mds-button
            icon={this.selected ? miBaselineCheckCircle : miOutlineCircle}
            variant="dark"
            tone="text"
            label={localeDefault[this.code]}
          ></mds-button>
        ) : (
          <mds-button
            icon={miBaselineCheckCircle}
            variant="error"
            tone="text"
            label={this.t.get('noCode')}
          ></mds-button>
        )}
      </Host>
    );
  }
}
