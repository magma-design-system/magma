import { Component, Host, Prop, h } from '@stencil/core'
import { TagTypes } from './types'
import { TypographyTypes } from '../../types'
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
  @Prop() readonly tag?: TagTypes

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographyTypes = 'detail'

  render() {
    const Tag = this.tag !== undefined ? this.tag : dictionary[this.typography].tag
    const { selector } = dictionary[this.typography]
    return (
      <Host>
        <Tag class={selector}>
          <slot></slot>
        </Tag>
      </Host>
    )
  }
}
