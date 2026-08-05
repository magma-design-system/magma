import miBaselineClose from '@icon/mi/baseline/close.svg';
import miBaselineExplore from '@icon/mi/baseline/explore.svg';
import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core';
import { KeyboardManager } from '@common/keyboard-manager';
import { LoadingType } from '@type/loading';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

@Component({
  tag: 'mds-url-view',
  styleUrl: 'mds-url-view.css',
  shadow: true,
})
export class MdsUrlView {
  @Element() host: HTMLMdsUrlViewElement;
  private km = new KeyboardManager();
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Specifies if domain is visible on header
   */
  @Prop({ reflect: true }) readonly icon?: string;

  /**
   * Specifies if the window has a label
   */
  @Prop({ reflect: true }) readonly label?: string;

  /**
   * Specifies the URL to the web page
   */
  @Prop({ reflect: true }) readonly src!: string;

  /**
   * Specifies whether a browser should load an iframe immediately
   * or to defer loading of images until some conditions are met.
   */
  @Prop({ reflect: true }) readonly loading?: LoadingType = 'lazy';

  private urlDomain = (url: string): string => {
    try {
      const domain = new URL(url);
      return domain.hostname.replace('www.', '');
    } catch {
      // src missing or not a valid absolute URL: fall back to the raw value
      return url ?? '';
    }
  };

  /**
   * Emits when the close button is clicked
   */
  @Event({ eventName: 'mdsUrlViewClose' }) closeEvent: EventEmitter<void>;

  private closeUrlView = (): void => {
    this.closeEvent.emit();
    this.host.closest('mds-modal')?.close();
  };

  componentDidLoad(): void {
    const close = this.host.shadowRoot?.querySelector<HTMLElement>('.action-close') ?? null;
    if (close !== null) {
      this.km.addElement(close);
      this.km.attachClickBehavior();
    }
  }

  disconnectedCallback(): void {
    this.km.detachClickBehavior();
  }

  render() {
    return (
      <Host
        aria-label={this.t.get('previewURL', { url: this.urlDomain(this.src) })}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class="window">
          <div class="header">
            <mds-icon class="window-icon" name={this.icon ?? miBaselineExplore}></mds-icon>
            <mds-text class="title" typography="caption">
              {this.label ?? this.urlDomain(this.src)}
            </mds-text>
            <mds-button
              title={this.t.get('close')}
              class="action-close"
              variant="dark"
              tone="text"
              icon={miBaselineClose}
              onClick={this.closeUrlView}
            ></mds-button>
          </div>
          <iframe
            class="iframe"
            aria-label={this.t.get('iframeURL', { url: this.urlDomain(this.src) })}
            src={this.src}
            loading={this.loading}
          />
        </div>
      </Host>
    );
  }
}
