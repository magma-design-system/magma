import { Component, Host, Prop, h } from '@stencil/core'
import { TagTypes } from '../../types/tag'
import { TypographyTypes } from '../../types/typography'
import { typographyDefaultsDictionary } from '../../dictionary/typography-defaults'

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
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyTypes = 'detail'

  render() {
    const Tag = this.tag !== undefined ? this.tag : typographyDefaultsDictionary[this.typography].tag
    const { selector } = typographyDefaultsDictionary[this.typography]
    return (
      <Host>
        <Tag class={selector}>
          <slot></slot>
        </Tag>
      </Host>
    )
  }
}
