import { Component, Host, h, Element, Method, State, Prop, Watch } from '@stencil/core'
import { KeyboardKeyName } from '@type/keyboard'
import miBaselineKeyboard from '@icon/mi/baseline/keyboard.svg'
import miBaselineDone from '@icon/mi/baseline/done.svg'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import keyboardKeys from '@meta/keyboard/keys.json'
import { KeyboardTest } from './meta/type'

@Component({
  tag: 'mds-keyboard',
  styleUrl: 'mds-keyboard.css',
  shadow: true,
})
export class MdsKeyboard {

  @Element() private host: HTMLMdsKeyboardElement
  private nodes: Node[]
  private errors: Set<string> = new Set()
  private filteredNodes: Element[]
  private buttonTrigger: HTMLMdsButtonElement
  private shortcutsEl: HTMLDivElement
  private keyEls: HTMLMdsKeyboardKeyElement[] = []
  private testInit: boolean = false
  private pressedKeys: Set<string> = new Set()
  private keyCombination: Set<string> = new Set()
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

  @State() testPassed?: boolean = undefined

  /**
   * Shows the keyboard key combination test result
   */
  @Prop({ mutable: true, reflect: true }) test?: KeyboardTest

  /**
   * Sets if the keyboard key combination test is enabled
   */
  @Prop({ reflect: true }) readonly try?: boolean

  componentWillLoad (): void {
    this.t.lang(this.host)
  }

  @Watch('try')
  handleTryProperty (newValaue: boolean): void {
    if (newValaue) {
      this.initKeyboardTest()
    }
  }

  private initKeyboardTest = (): void => {
    if (this.testInit) {
      return
    }
    this.testInit = true
    this.updateElements()
    this.shortcutsEl = this.host.shadowRoot?.querySelector('.shortcuts') as HTMLDivElement
    this.buttonTrigger = this.host.shadowRoot?.querySelector('.combination-checker') as HTMLMdsButtonElement
    this.buttonTrigger.removeAttribute('title')
    this.shortcutsEl.addEventListener('blur', this.stopKeyboardShortcutTest.bind(this))
    this.shortcutsEl.addEventListener('keydown', this.addKeyboardShortcut.bind(this))
    this.shortcutsEl.addEventListener('keyup', this.checkKeyboardShortcut.bind(this))
  }

  componentDidLoad (): void {
    this.nodes = this.host.shadowRoot?.querySelectorAll('slot')[0]?.assignedNodes() as Node[]
    this.filteredNodes = this.nodes.filter((node): node is Element => node.nodeType === 1)
    this.separateKeys()
    if (this.try) {
      this.initKeyboardTest()
    }
  }

  private separateKeys = (): void => {
    this.filteredNodes.forEach((node: HTMLMdsKeyboardKeyElement, index: number) => {
      if (index < this.filteredNodes.length - 1) {
        const separator: HTMLMdsTextElement = document.createElement('mds-text')
        separator.typography = 'detail'
        separator.innerHTML = '<b>+</b>'
        node.after(separator)
      }
    })
  }

  private updateElements = (): void => {
    this.filteredNodes.forEach((node: HTMLMdsKeyboardKeyElement) => {
      if (node.name) {
        this.keyEls.push(node)
        this.keyCombination.add(this.keyCodes(node.name.toLowerCase()).toString())
      }
    })
  }

  private checkTest = (): KeyboardTest | undefined => {
    if (this.testPassed === true) {
      return 'pass' as KeyboardTest
    }

    if (this.testPassed === false) {
      return 'fail' as KeyboardTest
    }

    return undefined
  }

  private checkKeyboardShortcut = (): void => {
    this.stopKeyboardShortcutTest()
    // console.log('json keys x', this.keyCombination)
    // console.log('os output x', this.pressedKeys)
    this.testPassed = this.areEquivalent(this.keyCombination, this.pressedKeys)
    this.test = this.checkTest()
    this.keyEls.forEach((el: HTMLMdsKeyboardKeyElement) => {
      el.removeAttribute('pressed')
    })
  }

  private keyCodes = (code: string): string[] => {
    return keyboardKeys[code.toLowerCase()].keyCodes
  }

  private hasKeyCode = (name: KeyboardKeyName, code: string): boolean => {
    return keyboardKeys[name.toLowerCase()].keyCodes.includes(code)
  }

  private areEquivalent = (set1: Set<string>, set2: Set<string>): boolean => {
    const array1 = Array.from(set1)
    const array2 = Array.from(set2)
    let isValid = true

    if (array1.length !== array2.length) {
      this.errors.add('wrongKeysCombination')
      return false
    }

    isValid = array1.every((value, index) => {
      const options = value.split(',')
      return options.includes(array2[index])
    })

    if (!isValid) {
      this.errors.add('wrongKeysCombination')
    }

    return isValid
  }

  private addKeyboardShortcut = (event: KeyboardEvent): void => {
    if (!document) {
      return
    }
    event.stopPropagation()
    event.preventDefault()
    const { code } = event
    this.pressedKeys.add(code)
    this.keyEls.forEach((el: HTMLMdsKeyboardKeyElement) => {
      if (this.hasKeyCode(el.name, code)) {
        el.pressed = true
      }
    })
  }

  private startKeyboardShortcutTest = (): void => {
    this.pressedKeys.clear()
    this.testPassed = undefined
    this.test = this.testPassed
    this.buttonTrigger.blur()
    this.buttonTrigger.await = true
    this.buttonTrigger.removeAttribute('tabindex')
    this.shortcutsEl.setAttribute('tabindex', '0')
    this.shortcutsEl.focus()
  }

  private stopKeyboardShortcutTest = (): void => {
    this.buttonTrigger.await = false
    this.buttonTrigger.setAttribute('tabindex', '0')
    this.shortcutsEl.removeAttribute('tabindex')
    this.shortcutsEl.removeEventListener('blur', this.stopKeyboardShortcutTest.bind(this))
    this.shortcutsEl.removeEventListener('keydown', this.addKeyboardShortcut.bind(this))
    this.shortcutsEl.removeEventListener('keyup', this.checkKeyboardShortcut.bind(this))
  }

  private getButtonIcon = (): string => {
    if (this.test === 'pass') {
      return miBaselineDone
    }

    if (this.test === 'fail') {
      return miBaselineClose
    }

    return miBaselineKeyboard
  }

  discottectedCallback (): void {
    this.stopKeyboardShortcutTest()
  }

  render () {
    return (
      <Host>
        <div class="shortcuts">
          <slot></slot>
        </div>
        { this.try && <mds-button icon={ this.getButtonIcon() } aria-title={ this.t.get('testKeyCombination') } class="combination-checker" variant="dark" tone="quiet" onClick={this.startKeyboardShortcutTest.bind(this)}></mds-button> }
        { this.try && <mds-tooltip target='.combination-checker'>
          { this.testPassed === undefined && this.t.get('testKeyCombination') }
          { this.testPassed === true && this.t.get('testPassed') }
          { this.testPassed === false && <div class="errors">
            {[...this.errors].map(error => (
              <mds-text typography='tip'>{ this.t.get(error) }</mds-text>
            ))}
          </div> }
        </mds-tooltip> }
      </Host>
    )
  }
}
