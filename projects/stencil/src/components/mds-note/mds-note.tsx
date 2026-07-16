import miBaselineClose from '@icon/mi/baseline/close.svg';
import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core';
import { KeyboardManager } from '@common/keyboard-manager';
import { ThemeLabelVariantType } from '@type/variant';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot title - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-note',
  styleUrl: 'mds-note.css',
  shadow: true,
})
export class MdsNote {
  @Element() private host: HTMLMdsNoteElement;
  private km = new KeyboardManager();
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

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
    this.km.detachClickBehavior();
  }

  render() {
    return (
      <Host
        role="note"
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.deletable && (
          <mds-button
            title={this.t.get('deleteLabel')}
            icon={miBaselineClose}
            class="button-close"
            variant="dark"
            tone="text"
            onClick={this.onClickClose}
          ></mds-button>
        )}
        <slot name="title" />
        <slot />
        <div aria-hidden="true" class="fold" />
      </Host>
    );
  }
}
