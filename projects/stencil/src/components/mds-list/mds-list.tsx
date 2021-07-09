import { Component, Host, h, Prop } from '@stencil/core'
import { ListTypeTypes } from '../../types'

@Component({
  tag: 'mds-list',
  styleUrl: 'mds-list.css',
  shadow: true,
})

export class MdsList {

  /**
   * Defines if the list is ordered or unordered
   */
  @Prop() readonly type: ListTypeTypes = 'unordered'

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
