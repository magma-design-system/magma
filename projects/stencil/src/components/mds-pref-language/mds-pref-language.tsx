import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import { MdsPrefLanguageEventDetail } from '@event/language';
import { MdsPrefChangeEventDetail } from '@event/preference';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg';
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg';
import { TabSizeType } from '@type/button';

/**
 * @slot - Add `mds-pref-language-item` element/s.
 */

@Component({
  tag: 'mds-pref-language',
  styleUrl: 'mds-pref-language.css',
  shadow: true,
})
export class MdsPrefLanguage {
  @State() showDropdown: boolean = false;
  @Element() element: HTMLMdsPrefLanguageElement;
  private readonly localStorageAlias: string = 'mdsPrefLanguage';
  private readonly defaultLanguage: string = 'en';
  private appliedLanguage?: string;
  private currentSelectedItem: HTMLMdsPrefLanguageItemElement;
  private elPreferLanguageItems: NodeListOf<HTMLMdsPrefLanguageItemElement>;
  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Sets the size of the component items nested inside it
   */
  @Prop({ reflect: true }) readonly size?: TabSizeType;

  /**
   * Specifies the language code based on HTML `lang` attribute
   *
   * A string representing the language version as defined in {@link https://datatracker.ietf.org/doc/html/rfc5646 RFC 5646: Tags for Identifying Languages (also known as BCP 47)}.
   *
   * `Examples of valid language codes include "en", "en-US", "fr", "fr-FR", "es-ES", etc.`
   *
   * Supported languages are Italiano, English, Español, ελληνικά
   */
  @Prop({ mutable: true, reflect: true }) set: string = 'auto';

  /**
   * Emits when the component changes the language selected from the click event of the dropdown list item
   */
  @Event({ eventName: 'mdsPrefLanguageChange' })
  languageChangeEvent: EventEmitter<MdsPrefLanguageEventDetail>;

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>;

  componentWillLoad(): void {
    this.setLanguage(this.set);
  }

  componentDidLoad(): void {
    this.checkLanguageSelect();
  }

  @Watch('set')
  handleSetChange(newValue: string): void {
    this.setLanguage(newValue);
  }

  private readonly toggleDropdown = (): void => {
    this.showDropdown = !this.showDropdown;
  };

  private readonly hideLanguageSelectDropdown = (): void => {
    this.showDropdown = false;
  };

  private readonly changeLanguageSelectItem = (): void => {
    this.elPreferLanguageItems.forEach((element) => {
      element.selected = false;
    });
  };

  private readonly checkLanguageSelect = (): void => {
    this.elPreferLanguageItems = this.element.querySelectorAll('mds-pref-language-item');
    this.elPreferLanguageItems.forEach((element) => {
      element.addEventListener('mdsPrefLanguageItemSelect', (e: CustomEvent) => {
        this.changeLanguageSelectItem();
        this.currentSelectedItem = e.currentTarget as HTMLMdsPrefLanguageItemElement;
        this.currentSelectedItem.selected = true;
        this.languageChangeEvent.emit({ language: this.currentSelectedItem.code });
        this.showDropdown = false;
        this.setLanguage(e.detail.language);
      });
    });

    this.elPreferLanguageItems.forEach((element) => {
      element.selected = element.code === this.set;
    });
  };

  private readonly sanitizeLanguage = (value: string): string => {
    if (value.includes('-')) {
      return value.split('-')[0].toLowerCase();
    }
    return value;
  };

  private readonly setLanguage = (set: string): void => {
    if (!/(auto)|^[a-z]{2}(-[A-Z]{2})?$/gm.exec(set)) {
      throw Error(`Language code set not reconized: ${set}`);
    }

    const systemLanguage = this.sanitizeLanguage(navigator.language);
    const userLanguage = localStorage.getItem(this.localStorageAlias);
    const pageLanguage = document.querySelector('html')?.getAttribute('lang') ?? null;
    const language =
      set === 'auto' ? (userLanguage ?? pageLanguage ?? systemLanguage) : this.sanitizeLanguage(set);

    this.set = language;
    // Re-applying the same language must not emit or write again (the `set`
    // watcher re-fires once after the normalization above)
    if (language === this.appliedLanguage) {
      return;
    }
    const isFirstApplication = this.appliedLanguage === undefined;
    this.appliedLanguage = language;

    localStorage.setItem(this.localStorageAlias, language);
    if (typeof document !== 'undefined') {
      document.querySelector('html')?.setAttribute('lang', language);
    }
    preferenceStore.state.language = language;

    if (!isFirstApplication) {
      this.prefChangeEvent.emit({ preference: 'language' });
    }
  };

  render() {
    return (
      <Host>
        <div class="menu">
          <mds-text class="info" typography="caption">
            <b>{this.t.get('label')}</b>
          </mds-text>
          <mds-tab fill size={this.size}>
            <mds-tab-item
              selected
              onClick={this.toggleDropdown}
              id="mds-pref-language-nav"
              class="item item--custom-language"
              icon-position="right"
              icon={this.showDropdown ? miBaselineKeyboardArrowUp : miBaselineKeyboardArrowDown}
              label={this.t.get(this.set ?? 'auto')}
            ></mds-tab-item>
          </mds-tab>
        </div>

        <mds-dropdown
          class="mds-pref-language-dropdown"
          target="#mds-pref-language-nav"
          interaction="none"
          visible={this.showDropdown}
          onMdsDropdownHide={this.hideLanguageSelectDropdown}
        >
          <slot></slot>
        </mds-dropdown>
        {this.set !== this.defaultLanguage && (
          <mds-text typography="caption">{this.t.get('defaultLanguage')}</mds-text>
        )}
      </Host>
    );
  }
}
