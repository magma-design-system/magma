import { Component, Host, Prop, h } from '@stencil/core'
import { TypographyTagType } from './meta/types'
import { TypographyType } from '../../types/typography'
import { typographyDefaultsVariaint } from './meta/variants'
import clsx from 'clsx'

@Component({
  tag: 'mds-text',
  styleUrl: 'mds-text.css',
  shadow: true,
})
export class MdsText {
  /**
   * Specifies the HTML tag of the element
   */
  @Prop() readonly tag?: TypographyTagType

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyType = 'detail'

  render () {
    const Tag = this.tag !== undefined ? this.tag : typographyDefaultsVariaint[this.typography].tag
    const { selector } = typographyDefaultsVariaint[this.typography]
    return (
      <Host class={clsx(selector)}>
        <Tag class="text">
          <slot></slot>
        </Tag>
      </Host>
    )
  }
}
