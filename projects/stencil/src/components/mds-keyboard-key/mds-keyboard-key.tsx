import { Component, Host, h, Element, Prop, State, Method } from '@stencil/core'
import { KeyboardKeyName } from '@type/keyboard'
import keyboardKeysData from '@meta/keyboard/keys.json'
import { KeyboardKeyMap } from '@type/keyboard'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

import miBaselineKeyboardReturn from '@icon/mi/baseline/keyboard-return.svg'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'
import miBaselineKeyboardArrowLeft from '@icon/mi/baseline/keyboard-arrow-left.svg'
import miBaselineKeyboardArrowRight from '@icon/mi/baseline/keyboard-arrow-right.svg'
import miBaselineKeyboardTab from '@icon/mi/baseline/keyboard-tab.svg'
import miBaselineKeyboardCommandKey from '@icon/mi/baseline/keyboard-command-key.svg'
import miBaselineKeyboardOptionKey from '@icon/mi/baseline/keyboard-option-key.svg'
import miSharpWindow from '@icon/mi/sharp/window.svg'
import miOutlineBackspace from '@icon/mi/outline/backspace.svg'
import miBaselineKeyboardCapslock from '@icon/mi/baseline/keyboard-capslock.svg'
import mdiKeyboardSpace from '@icon/mdi/keyboard-space.svg'
import miBaselineNorth from '@icon/mi/baseline/north.svg'
import miBaselineSouth from '@icon/mi/baseline/south.svg'
import mdiKeyboardShift from '@icon/mdi/apple-keyboard-shift.svg'
import miBaselineBrokenImage from '@icon/mi/baseline/broken-image.svg'
import miBaselineVerticalAlignTop from '@icon/mi/baseline/vertical-align-top.svg'
import miBaselineVerticalAlignBottom from '@icon/mi/baseline/vertical-align-bottom.svg'

const icons = new Map<KeyboardKeyName, string>()
icons.set('arrowdown', miBaselineKeyboardArrowDown)
icons.set('arrowleft', miBaselineKeyboardArrowLeft)
icons.set('arrowright', miBaselineKeyboardArrowRight)
icons.set('arrowup', miBaselineKeyboardArrowUp)
icons.set('command', miBaselineKeyboardCommandKey)
icons.set('commandleft', miBaselineKeyboardCommandKey)
icons.set('commandright', miBaselineKeyboardCommandKey)
icons.set('delete', miOutlineBackspace)
icons.set('capslock', miBaselineKeyboardCapslock)
icons.set('backspace', miOutlineBackspace)
icons.set('enter', miBaselineKeyboardReturn)
icons.set('home', miBaselineVerticalAlignTop)
icons.set('end', miBaselineVerticalAlignBottom)
icons.set('option', miBaselineKeyboardOptionKey)
icons.set('optionleft', miBaselineKeyboardOptionKey)
icons.set('optionright', miBaselineKeyboardOptionKey)
icons.set('pagedown', miBaselineSouth)
icons.set('pageup', miBaselineNorth)
icons.set('shift', mdiKeyboardShift)
icons.set('shiftleft', mdiKeyboardShift)
icons.set('shiftright', mdiKeyboardShift)
icons.set('space', mdiKeyboardSpace)
icons.set('tab', miBaselineKeyboardTab)
icons.set('windows', miSharpWindow)
icons.set('windowsleft', miSharpWindow)
icons.set('windowsright', miSharpWindow)

@Component({
  tag: 'mds-keyboard-key',
  styleUrl: 'mds-keyboard-key.css',
  shadow: true,
})
export class MdsKeyboardKey {

  @Element() private host: HTMLMdsKeyboardElement
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  private keyboardKeys = keyboardKeysData as KeyboardKeyMap

  /**
   * Sets the code of the keyboard key for combination tests if `try` attribute is set from `mds-keyboard` parent component
   */
  @Prop({ reflect: true }) readonly name: KeyboardKeyName

  /**
   * Sets if the key is pressed or not
   */
  @Prop({ reflect: true }) readonly pressed?: boolean

  private getTitle = (): string | undefined => {
    if (this.name) {
      return this.t.get(this.keyboardKeys[this.name.toLowerCase()].description, { character: this.keyboardKeys[this.name.toLowerCase()].alias, keyboardPosition: this.keyboardKeys[this.name.toLowerCase()].keyboardPosition })
    }
    return undefined
  }

  componentWillLoad (): void {
    this.t.lang(this.host)
  }

  render () {
    return (
      <Host title={this.getTitle()}>
        <div class="physical-key">
          { this.name && icons.has(this.name)
            ? <mds-icon name={icons.get(this.name) ?? miBaselineBrokenImage} class="shortcut-icon" />
            : <mds-text class="shortcut-text" typography="detail">{ this.name && <b>{this.keyboardKeys[this.name].alias}</b> }</mds-text>
          }
          { this.name && this.keyboardKeys[this.name]?.keyboardPosition && <mds-text typography="label">
            { this.keyboardKeys[this.name].keyboardPosition?.left && 'l'}
            { this.keyboardKeys[this.name].keyboardPosition?.right && 'r'}
          </mds-text> }
        </div>
      </Host>
    )
  }
}
