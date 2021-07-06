import { Component, Host, Prop, h } from '@stencil/core'
import { TagTypes, TypeTypes } from './interface'
import dictionary from './defaults'

@Component({
  tag: 'mds-text',
  styleUrl: 'mds-text.css',
  shadow: true,
})
export class MdsText {
  /**
   * Specifies the HTML tag of the element
   */
  @Prop() tag?: TagTypes

  /**
   * Specifies the typography of the element
   */
  @Prop() type: TypeTypes = 'detail'

  render() {
    const Tag = this.tag !== undefined ? this.tag : dictionary[this.type].tag
    const { selector } = dictionary[this.type]
    return (
      <Host>
        <Tag class={selector}>
          <slot></slot>
        </Tag>
      </Host>
    )
  }
}
