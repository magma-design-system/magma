import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import miBaselineNavigateNext from '@icon/mi/baseline/navigate-next.svg'
import { BreadcrumbClickedEvent } from '../mds-breadcrumb/meta/interface'

@Component({
  tag: 'mds-breadcrumb-item',
  styleUrl: 'mds-breadcrumb-item.css',
  shadow: true,
})
export class MdsBreadcrumbItem {

  @Element() private element: HTMLMdsBreadcrumbItemElement

  /**
   * Choose to display or not the back arrow button
   */
  @Prop({ mutable: true, reflect: true }) active?: boolean

  private toggle = () => {
    this.active = !this.active
    this.activedEvent.emit({ id: this.element.id, active: this.active })
  }

  /**
   * Emits when the breadcrumb is active
   */
  @Event() activedEvent: EventEmitter<BreadcrumbClickedEvent>

  render () {
    return (
      <Host slot="breadcrumb-item" tabindex="0" onClick={ this.toggle }>
        <mds-text class="text" typography="detail">
          <slot/>
        </mds-text>
        <i class="svg icon" innerHTML={miBaselineNavigateNext}/>
      </Host>
    )
  }

}
