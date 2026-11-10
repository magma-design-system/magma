import { Component, Host, h, Element, Listen, State, Prop, Watch } from '@stencil/core';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { TabSizeType } from '@type/button';
import { MdsPrefChangeEventDetail } from '@event/preference';

// The mounted instances: `data-magma-pref` stays on <html> while any of them is, so
// a settings page unmounting its own mds-pref leaves the app controller in charge.
const mountedPrefs = new Set<HTMLElement>();

/**
 * @name Pref
 * @description This component is based on MdsTab component pattern
 * @overview
 *  <mds-text>Accessibility preferences in web browsers allow users to customize their navigation to improve readability, interaction, and usability. Common options include dark mode, text resizing, screen reader support, keyboard navigation, and blocking animated content. These settings help people with visual, hearing, motor, or cognitive disabilities experience the web more effectively and inclusively.</mds-text>
 * @tags pattern, user, tab
 * @slot - Add `mds-pref-animation`, `mds-pref-consumption`, `mds-pref-contrast`, `mds-pref-language`, `mds-pref-mode` or `mds-pref-theme` element/s.
 * @example <mds-pref>
 *    <mds-pref-animation></mds-pref-animation>
 *    <mds-pref-consumption></mds-pref-consumption>
 *    <mds-pref-contrast></mds-pref-contrast>
 *    <mds-pref-mode></mds-pref-mode>
 *    <mds-pref-theme></mds-pref-theme>
 *    <mds-pref-language>
 *      <mds-pref-language-item code="it"></mds-pref-language-item>
 *      <mds-pref-language-item code="en"></mds-pref-language-item>
 *    </mds-pref-language>
 *  </mds-pref>
 * @category preferences
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
  private loaded = false;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

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

  /**
   * Tells the panel that the application follows `<html lang>` on its own, translating its
   * content as the language changes, so a change of language needs no reload and shows no notice
   */
  @Prop({ reflect: true }) readonly liveLanguage?: boolean;

  // A preference whose change the content of the page may not follow until a reload: the
  // consumption, and the language unless the application follows it live
  private needsReload = (preference?: string): boolean =>
    preference !== undefined &&
    this.prefNeedsReload.includes(preference) &&
    !(preference === 'language' && this.liveLanguage);

  private sizeChildren = (size?: TabSizeType): void => {
    const allElements = Array.from(this.host.querySelectorAll('*'));
    const elements = allElements.filter((el) => el.tagName.toLowerCase().startsWith('mds-pref-'));
    elements.forEach((element: HTMLMdsTabElement) => {
      element.size = size;
    });
  };

  @Watch('size')
  handleSizeChange(newValue?: TabSizeType): void {
    this.sizeChildren(newValue);
  }

  // The watcher does not run for the value of load, which reached no child (#826): a size set on
  // the panel reaches its controls on load, and the ones added later; without one, each control
  // keeps its own
  private applySize = (): void => {
    if (this.size !== undefined) this.sizeChildren(this.size);
  };

  componentWillLoad(): void {
    this.applySize();
  }

  // A move disconnects the host and connects it again, while componentDidLoad runs
  // once: the flag follows the connection, so a panel moved between a sidebar and a
  // menu keeps the OS fallback off (#922).
  connectedCallback(): void {
    mountedPrefs.add(this.host);
    if (typeof window !== 'undefined') {
      document.documentElement?.setAttribute('data-magma-pref', '');
    }
  }

  componentDidLoad(): void {
    this.loaded = true;
  }

  disconnectedCallback(): void {
    // In the lazy build the instance can hear of a disconnect after the host is back
    // on the page: it is still mounted then
    if (this.host.isConnected) return;
    mountedPrefs.delete(this.host);
    if (typeof window !== 'undefined' && mountedPrefs.size === 0) {
      document.documentElement?.removeAttribute('data-magma-pref');
    }
  }

  // Host listeners: Stencil removes them on disconnect and adds them back on connect.
  // The notice is for the visible panel: it was shown only by the controller, which is hidden.
  // A change heard before the panel loaded is a control applying the stored choice, no pick.
  @Listen('mdsPrefChange')
  handlePrefChange(e: CustomEvent<MdsPrefChangeEventDetail>): void {
    if (this.loaded && !this.controller && this.needsReload(e.detail?.preference)) {
      this.showReload = true;
    }
  }

  render() {
    return (
      <Host>
        <slot onSlotchange={this.applySize}></slot>
        {this.showReload && (
          <div class="reload-required">
            <mds-text typography="caption">{this.t.get('reloadPageToSeeChanges')}</mds-text>
          </div>
        )}
      </Host>
    );
  }
}
