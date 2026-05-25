import { Component, Host, h, Element, State, Method, Prop, Watch } from '@stencil/core';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { TabSizeType } from '@type/button';

/**
 * @name Pref
 * @description This component is based on MdsTab component pattern
 * @overview
 *  <mds-text>Accessibility preferences in web browsers allow users to customize their navigation to improve readability, interaction, and usability. Common options include dark mode, text resizing, screen reader support, keyboard navigation, and blocking animated content. These settings help people with visual, hearing, motor, or cognitive disabilities experience the web more effectively and inclusively.</mds-text>
 * @category Patterns
 * @tags pattern, user, tab
 * @slot default - Add `mds-pref-animation`, `mds-pref-consumption`, `mds-pref-contrast`, `mds-pref-language`, or `mds-pref-theme` element/s.
 * @example <mds-pref>
 *    <mds-pref-animation></mds-pref-animation>
 *    <mds-pref-consumption></mds-pref-consumption>
 *    <mds-pref-contrast></mds-pref-contrast>
 *    <mds-pref-theme></mds-pref-theme>
 *    <mds-pref-language>
 *      <mds-pref-language-item code="it"></mds-pref-language-item>
 *      <mds-pref-language-item code="en"></mds-pref-language-item>
 *    </mds-pref-language>
 *  </mds-pref>
 */

@Component({
  tag: 'mds-pref',
  styleUrl: 'mds-pref.css',
  shadow: true,
})
export class MdsPref {
  /**
   * Sets the size of the component items nested inside it
   */
  @Prop({ reflect: true }) readonly size?: TabSizeType;

  @Element() host: HTMLMdsPrefElement;
  @State() showReload: boolean = false;
  private prefNeedsReload: string[] = ['consumption', 'language'];
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  @State() language: string;
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.host);
  }

  /**
   * Sets if the component works as hidden element controller instead as UI element, visible on the DOM
   */
  @Prop({ reflect: true, mutable: true }) controller?: boolean;

  @Watch('controller')
  handleControllerChange(newValue?: boolean): void {
    if (newValue === false) {
      this.controller = undefined;
    }
  }

  @Watch('size')
  handleSizeChange(newValue?: TabSizeType): void {
    const allElements = Array.from(this.host.querySelectorAll('*'));
    const elements = allElements.filter((el) => el.tagName.toLowerCase().startsWith('mds-pref-'));
    elements.forEach((element: HTMLMdsTabElement) => {
      element.size = newValue;
    });
  }

  componentWillRender(): void {
    this.t.lang(this.host);
  }

  componentDidLoad(): void {
    if (window) {
      document.documentElement?.setAttribute('data-magma-pref', '');
    }
    if (this.controller) {
      this.addPerfEvents();
    }
  }

  disconnectedCallback(): void {
    if (window) {
      document.documentElement?.removeAttribute('data-magma-pref');
    }
    this.removePerfEvents();
  }

  private addPerfEvents = (): void => {
    this.addEvent(this.host.querySelector('mds-pref-consumption') as HTMLElement);
    this.addEvent(this.host.querySelector('mds-pref-contrast') as HTMLElement);
    this.addEvent(this.host.querySelector('mds-pref-language') as HTMLElement);
    this.addEvent(this.host.querySelector('mds-pref-theme') as HTMLElement);
    this.addEvent(this.host.querySelector('mds-pref-theme-variant') as HTMLElement);
  };

  private removePerfEvents = (): void => {
    this.removeEvent(this.host.querySelector('mds-pref-consumption') as HTMLElement);
    this.removeEvent(this.host.querySelector('mds-pref-contrast') as HTMLElement);
    this.removeEvent(this.host.querySelector('mds-pref-language') as HTMLElement);
    this.removeEvent(this.host.querySelector('mds-pref-theme') as HTMLElement);
    this.removeEvent(this.host.querySelector('mds-pref-theme-variant') as HTMLElement);
  };

  private handlePrefChangeEvent = (e: CustomEvent): void => {
    if (this.prefNeedsReload.includes(e.detail.preference)) {
      this.showReload = true;
      if (e.detail.preference === 'language') {
        this.t.lang(this.host);
      }
    }
  };

  private addEvent = (element?: HTMLElement): void => {
    if (!element) return;
    element.addEventListener('mdsPrefChange', this.handlePrefChangeEvent.bind(this));
  };

  private removeEvent = (element?: HTMLElement): void => {
    if (!element) return;
    element.removeEventListener('mdsPrefChange', this.handlePrefChangeEvent.bind(this));
  };

  render() {
    return (
      <Host>
        <slot></slot>
        {this.showReload && (
          <div class="reload-required">
            <mds-text typography="caption">{this.t.get('reloadPageToSeeChanges')}</mds-text>
          </div>
        )}
      </Host>
    );
  }
}
