import { Component, Host, Prop, h } from '@stencil/core'
import { TagTypes, TypeTypes } from './interface'
import dictionary from './defaults'

@Component({
  tag: 'mds-text',
  styleUrl: 'mds-text.css',
  shadow: true,
})
export class MdsText {

  @Prop() tag?: TagTypes
  @Prop() type: TypeTypes = 'detail'

  render() {
    let Tag = this.tag ? this.tag : dictionary[this.type].tag
    const selector = dictionary[this.type].selector
    return (
      <Host>
        <Tag class={selector}>
          <slot></slot>
        </Tag>
      </Host>
    )
  }
}
