import { Component, Host, h, Element, Prop } from '@stencil/core'
import { KeyboarKeyName } from '@type/keyboard'
import { closest } from '@common/string'
import keyboardKeys from '@meta/keyboard/keys.json'

@Component({
  tag: 'mds-keyboard-key',
  styleUrl: 'mds-keyboard-key.css',
  shadow: true,
})
export class MdsKeyboardKey {

  @Element() private host: HTMLMdsKeyboardElement

  /**
   * Sets the code of the keyboard key for test if enabled from `mds-keyboard` parent component
   */
  @Prop({ reflect: true, mutable: true }) code?: KeyboarKeyName

  /**
   * Sets if the key is pressed or not
   */
  @Prop({ reflect: true }) readonly pressed?: boolean

  componentWillLoad (): void {
    if (!this.code) {
      this.code = closest(this.host.textContent?.toLowerCase() as string, Object.keys(keyboardKeys)) as KeyboarKeyName
    }
  }

  render () {
    return (
      <Host title="Missing explanation">
        <mds-text class="shortcut-text" typography="detail"><b><slot/></b></mds-text>
      </Host>
    )
  }
}
