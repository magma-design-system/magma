import { Component, Host, h, Listen, Prop, Element } from '@stencil/core'
import { InputValueType } from '@type/input-value-type'

@Component({
  tag: 'mds-input-switch-group',
  styleUrl: 'mds-input-switch-group.css',
  shadow: true,
})
export class MdsInputSwitchGroup {

  /**
   * Specifies the name of the group
   */
  @Prop() name: string

  @Element() private element: HTMLMdsInputSwitchGroupElement

  @Listen('mdsInputSwitchChange')
  onValueChange (event: CustomEvent<{ name: string, value: InputValueType }>): void {
    const radios = this.element.querySelectorAll<HTMLMdsInputSwitchElement>(`mds-input-switch[name="${this.name}"]`)
    this.validateRadios(radios, event.detail.value)
  }

  private validateRadios (radios: NodeListOf<HTMLMdsInputSwitchElement>, value: InputValueType): void {
    radios.forEach(radio => radio.checked = radio.value === value)
  }

  /**
 * @slot default - Put mds-input-switch elements here
 */

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
