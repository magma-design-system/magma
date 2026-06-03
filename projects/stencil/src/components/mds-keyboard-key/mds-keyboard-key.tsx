import { Component, Host, h, Element, Prop, State, Method } from '@stencil/core';
import { KeyboardKeyName } from '@type/keyboard';
import keyboardKeysData from '@meta/keyboard/keys.json';
import { KeyboardKeyMap } from '@type/keyboard';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

import miBaselineBrokenImage from '@icon/mi/baseline/broken-image.svg';
import { icons } from './meta/icons';

@Component({
  tag: 'mds-keyboard-key',
  styleUrl: 'mds-keyboard-key.css',
  shadow: true,
})
export class MdsKeyboardKey {
  @Element() private host: HTMLMdsKeyboardElement;
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

  private keyboardKeys = keyboardKeysData as KeyboardKeyMap;

  /**
   * Sets the code of the keyboard key for combination tests if `try` attribute is set from `mds-keyboard` parent component
   */
  @Prop({ reflect: true }) readonly name: KeyboardKeyName;

  /**
   * Sets if the key is pressed or not
   */
  @Prop({ reflect: true }) readonly pressed?: boolean;

  private getTitle = (): string | undefined => {
    if (this.name) {
      return this.t.get(this.keyboardKeys[this.name.toLowerCase()].description, {
        character: this.keyboardKeys[this.name.toLowerCase()].alias,
        keyboardPosition: this.keyboardKeys[this.name.toLowerCase()].keyboardPosition,
      });
    }
    return undefined;
  };

  componentWillLoad(): void {
    this.t.lang(this.host);
  }

  render() {
    return (
      <Host title={this.getTitle()}>
        <div class="physical-key">
          {this.name && icons.has(this.name) ? (
            <mds-icon name={icons.get(this.name) ?? miBaselineBrokenImage} class="shortcut-icon" />
          ) : (
            <mds-text class="shortcut-text" typography="detail">
              {this.name && <b>{this.keyboardKeys[this.name].alias}</b>}
            </mds-text>
          )}
          {this.name && this.keyboardKeys[this.name]?.keyboardPosition && (
            <mds-text typography="label">
              {this.keyboardKeys[this.name].keyboardPosition?.left && 'l'}
              {this.keyboardKeys[this.name].keyboardPosition?.right && 'r'}
            </mds-text>
          )}
        </div>
      </Host>
    );
  }
}
