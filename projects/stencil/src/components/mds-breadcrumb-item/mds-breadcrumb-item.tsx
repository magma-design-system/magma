import { Component, Host, h } from '@stencil/core'
import miBaselineNavigateNext from '@icon/mi/baseline/navigate-next.svg'

@Component({
  tag: 'mds-breadcrumb-item',
  styleUrl: 'mds-breadcrumb-item.css',
  shadow: true,
})
export class MdsBreadcrumbItem {

  render () {
    return (
      <Host slot="breadcrumb-item">
        <mds-text class="text" typography="detail">
          <slot/>
        </mds-text>
        <i class="svg icon" innerHTML={miBaselineNavigateNext}/>
      </Host>
    )
  }

}
