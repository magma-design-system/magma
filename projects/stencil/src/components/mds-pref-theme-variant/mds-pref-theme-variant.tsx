import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  State,
  Method,
} from '@stencil/core';
import { MdsPrefThemeVariantEventDetail } from '@event/theme-variant';
import { MdsPrefChangeEventDetail } from '@event/preference';
import { PreferenceThemeSchemeType } from '@type/preference';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg';
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg';
import { TabSizeType } from '@type/button';

/**
 * @slot - Add `mds-pref-theme-variant-item` element/s.
 */

@Component({
  tag: 'mds-pref-theme-variant',
  styleUrl: 'mds-pref-theme-variant.css',
  shadow: true,
})
export class MdsPrefThemeVariant {
  @State() showDropdown: boolean = false;
  @Element() element: HTMLMdsPrefLanguageElement;
  private readonly localStorageAliasThemeName: string = 'mdsPrefThemeName';
  private readonly localStorageAliasThemeScheme: string = 'mdsPrefThemeScheme';
  private readonly defaultTheme: string = 'default';
  private currentSelectedItem: HTMLMdsPrefThemeVariantItemElement;
  private elPreferThemeVariantItems: NodeListOf<HTMLMdsPrefThemeVariantItemElement>;
  private userThemeName: string | null;
  private userThemeScheme: PreferenceThemeSchemeType | null;
  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  @State() language: string;
  /**
   * Updates the component's texts to the locale currently set on the host element.
   */
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.element);
  }
  private readonly clasNameThemeNamePrefix: string = 'pref-theme-name-';
  private previousName: string | null = null;
  private readonly customPropertyAliasThemeScheme: string = '--magma-pref-theme-scheme';
  private readonly customPropertyAliasThemeName: string = '--magma-pref-theme-name';
  private readonly schemeSet = {
    light: 'pref-theme-scheme-light',
    dark: 'pref-theme-scheme-dark',
    all: 'pref-theme-scheme-all',
  };

  /**
   * Sets the size of the component items nested inside it
   */
  @Prop({ reflect: true }) readonly size?: TabSizeType;

  /**
   * Specifies the theme name attribute
   * A string representing the theme name, should be a simple string name or kebab kase name.
   * `Examples of valid language codes include "magma", "maggioli-editore", etc.`
   */
  @Prop({ mutable: true, reflect: true }) name: string = 'default';

  /**
   * Specifies the theme scheme which can be 'light', 'dark' or 'all'
   * Default is 'all' which means this theme supporto both light and dark.
   * If you set 'light' means this theme support only light mode and will be forced and shown light colors mode only.
   */
  @Prop({ mutable: true, reflect: true }) scheme: PreferenceThemeSchemeType = 'all';

  /**
   * Emits when the component changes the language selected from the click event of the dropdown list item
   */
  @Event({ eventName: 'mdsPrefThemeVariantChange' })
  themeChangeEvent: EventEmitter<MdsPrefThemeVariantEventDetail>;

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>;

  componentDidLoad(): void {
    this.checkThemeVariantSelect();
  }

  componentWillRender(): void {
    this.userThemeName = localStorage.getItem(this.localStorageAliasThemeName);
    this.userThemeScheme = localStorage.getItem(this.localStorageAliasThemeScheme) as
      | PreferenceThemeSchemeType
      | 'all';
    this.setThemeVariant(this.userThemeName ?? this.name, this.userThemeScheme ?? this.scheme);
    this.t.lang(this.element);
  }

  private readonly toggleDropdown = (): void => {
    this.showDropdown = !this.showDropdown;
  };

  private readonly hideThemeVariantDropdownSelect = (): void => {
    this.showDropdown = false;
  };

  private readonly changeThemeVariantItem = (): void => {
    this.elPreferThemeVariantItems.forEach((element) => {
      element.selected = false;
    });
  };

  private readonly checkThemeVariantSelect = (): void => {
    this.elPreferThemeVariantItems = this.element.querySelectorAll('mds-pref-theme-variant-item');
    this.elPreferThemeVariantItems.forEach((element) => {
      element.addEventListener('mdsPrefThemeVariantItemSelect', (e: CustomEvent) => {
        this.changeThemeVariantItem();
        this.currentSelectedItem = e.currentTarget as HTMLMdsPrefThemeVariantItemElement;
        this.currentSelectedItem.selected = true;
        const name: string = e.detail.name.toLowerCase();
        const scheme: PreferenceThemeSchemeType = e.detail.scheme.toLowerCase();
        this.themeChangeEvent.emit({ name, scheme });
        this.showDropdown = false;
        this.setThemeVariant(name, scheme);
        this.t.update(document);
      });
    });

    this.elPreferThemeVariantItems.forEach((element) => {
      element.selected = element.name === this.name;
    });
  };

  private readonly setThemeVariant = (name: string, scheme: PreferenceThemeSchemeType): void => {
    if (!/^[a-z]+(-[a-z]+)*$/gm.exec(name)) {
      throw Error(`Theme variant name not valid: ${name}`);
    }
    this.name = name;
    this.scheme = scheme;
    this.prefChangeEvent.emit({ preference: 'theme-variant' });
    localStorage.setItem(this.localStorageAliasThemeName, this.name);
    localStorage.setItem(this.localStorageAliasThemeScheme, this.scheme);

    if (typeof document !== 'undefined') {
      const element = document.querySelector('html');
      // cleanup previeous selection
      for (const key in this.schemeSet) {
        if ({}.hasOwnProperty.call(this.schemeSet, key)) {
          element?.classList.remove(this.schemeSet[key]);
        }
      }
      if (this.previousName !== null && this.previousName !== '') {
        element?.classList.remove(this.clasNameThemeNamePrefix + this.previousName);
      }
      // set new selection
      element?.setAttribute('data-theme-name', this.name);
      element?.classList.add(this.schemeSet[this.scheme]);
      element?.classList.add(this.clasNameThemeNamePrefix + this.name);
      element?.style.setProperty(this.customPropertyAliasThemeName, this.name);
      element?.style.setProperty(this.customPropertyAliasThemeScheme, this.scheme);
      this.previousName = this.name;
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
              id="mds-pref-theme-variant-nav"
              class="item item--custom-theme-variant"
              icon-position="right"
              icon={this.showDropdown ? miBaselineKeyboardArrowUp : miBaselineKeyboardArrowDown}
            >
              {this.name}
            </mds-tab-item>
          </mds-tab>
        </div>
        <mds-dropdown
          class="mds-pref-theme-variant-dropdown"
          target="#mds-pref-theme-variant-nav"
          interaction="none"
          visible={this.showDropdown}
          onMdsDropdownHide={this.hideThemeVariantDropdownSelect}
          autoPlacement
        >
          <slot></slot>
        </mds-dropdown>
        {this.name !== this.defaultTheme && (
          <mds-text typography="caption">{this.t.get('defaultTheme')}</mds-text>
        )}
      </Host>
    );
  }
}
