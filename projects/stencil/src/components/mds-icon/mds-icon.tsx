import { Component, Host, h, Prop } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-icon',
  styleUrl: 'mds-icon.css',
  shadow: false,
})
export class MdsIcon {

  /**
   * The name of the icon set.
   * The icon set is strictly realted to @maggioli-design-system/icons
   */
  @Prop() readonly name!: string

  render () {
    return (
      <Host class={clsx(this.name)}/>
    )
  }
}



<mds-icon-house/>
