import { Component, Host, h, Prop } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-paginator-item',
  styleUrl: 'mds-paginator-item.css',
  shadow: false,
})
export class MdsPaginatorItem {

  /**
   * Specifies the icon used inside the paginator item
   */
  @Prop() readonly icon?:string

  /**
   * Specifies if the item is active or not, is handled from the parent paginator
   */
  @Prop({ reflect: true }) readonly active?:boolean

  /**
   * Specifies if the item is disabled or not, is handled from the parent paginator
   */
  @Prop({ reflect: true }) readonly disabled?:boolean

  render () {
    return (
      <Host class={clsx(
        this.active && 'active',
        this.disabled && 'disabled',
        this.icon && 'icon',
      )}>
        { this.icon !== undefined
          ? <mds-icon name={this.icon}/>
          : <mds-text class="text" typography="detail">
            <slot></slot>
          </mds-text>
        }
      </Host>
    )
  }

}
