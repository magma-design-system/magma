import { Component, Host, h, Prop } from '@stencil/core'

@Component({
  tag: 'mds-icon',
  styleUrl: 'mds-icon.css',
  shadow: true,
})
export class MdsIcon {

  /**
   * The name of the icon set.
   * The icon set is strictly realted to @maggioli-design-system/icons
   */
  @Prop() readonly name?: string

  render () {
    return (
      <Host class={`mgg-icons-${this.name}`}/>
    )
  }
}
