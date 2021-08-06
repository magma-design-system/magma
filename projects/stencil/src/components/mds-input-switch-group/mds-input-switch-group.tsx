import { Component, Host, h, Listen, Prop } from '@stencil/core'
import { InputValueType } from '../../types/input-value-type'

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

  @Listen('changeEvent')
  changeEventHandler (event: CustomEvent<{ name: string, value: InputValueType }>): void {
    // Cares only about changes on mds-input-switch with the same name
    if (event.detail.name === this.name) {
      console.log('Received the custom changeEvent event: ', this.name, event.detail)
      const radios = document.querySelectorAll<HTMLMdsInputSwitchElement>(`mds-input-switch[name="${this.name}"]`)
      this.validateRadios(radios, event.detail.value)
    }
  }

  private validateRadios (radios: NodeListOf<HTMLMdsInputSwitchElement>, value: InputValueType): void {
    radios.forEach(radio => radio.checked = radio.value === value)
  }

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
