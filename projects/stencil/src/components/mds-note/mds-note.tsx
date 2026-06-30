import miBaselineClose from '@icon/mi/baseline/close.svg';
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
import { KeyboardManager } from '@common/keyboard-manager';
import { ThemeLabelVariantType } from '@type/variant';
import { Locale } from '@common/locale';
import { subscribePreference } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot title - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-note',
  styleUrl: 'mds-note.css',
  shadow: true,
})
export class MdsNote {
  @Element() private host: HTMLMdsNoteElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;
  private km = new KeyboardManager();
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
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean = false;

  /**
   * Specifies the color variant for the element
   */
  @Prop({ reflect: true }) readonly variant?: ThemeLabelVariantType = 'yellow';

  private onClickClose = () => {
    this.deleteEvent.emit();
  };

  /**
   * Emits when the note has to be cancelled
   */
  @Event({ eventName: 'mdsNoteDelete' }) deleteEvent: EventEmitter<void>;

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
    this.unsubscribePrefContrast = subscribePreference('contrast', (value) => {
      this.prefContrast = value;
    });
    this.unsubscribePrefTheme = subscribePreference('theme', (value) => {
      this.prefTheme = value;
    });
    this.unsubscribePrefThemeScheme = subscribePreference('theme-scheme', (value) => {
      this.prefThemeScheme = value;
    });
  }

  componentWillLoad(): void {
    this.t.lang(this.host);
  }

  componentDidLoad(): void {
    this.km.addElement(this.host);
    this.km.attachClickBehavior();
  }

  componentDidUpdate(): void {
    if (this.deletable) {
      this.km.addElement(this.host);
      this.km.attachClickBehavior();
      return;
    }

    this.km.detachClickBehavior();
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
    this.unsubscribePrefContrast?.();
    this.unsubscribePrefTheme?.();
    this.unsubscribePrefThemeScheme?.();
    this.km.detachClickBehavior();
  }

  render() {
    return (
      <Host
        role="note"
        pref-animation={this.prefAnimation}
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        {this.deletable && (
          <mds-button
            title={this.t.get('deleteLabel')}
            icon={miBaselineClose}
            class="button-close"
            variant="dark"
            tone="text"
            onClick={this.onClickClose.bind(this)}
          ></mds-button>
        )}
        <slot name="title" />
        <slot />
        <div aria-hidden="true" class="fold" />
      </Host>
    );
  }
}
