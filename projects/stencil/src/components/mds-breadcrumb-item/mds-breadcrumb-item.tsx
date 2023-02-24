import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import miBaselineNavigateNext from '@icon/mi/baseline/navigate-next.svg'
import { BreadcrumbClickedEvent } from '../mds-breadcrumb/meta/interface'
import { KeyboardManager } from '@common/keyboard-manager'

@Component({
  tag: 'mds-breadcrumb-item',
  styleUrl: 'mds-breadcrumb-item.css',
  shadow: true,
})
export class MdsBreadcrumbItem {

  @Element() private element: HTMLMdsBreadcrumbItemElement
  private km = new KeyboardManager()

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

  componentDidLoad ():void {
    const textElement = this.element.shadowRoot.querySelector('.text') as HTMLElement
    this.km.addElement(textElement)
    this.km.attachClickBehavior()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host>
        <mds-text tabindex="0" onClick={ this.toggle } class="text focusable" typography="detail">
          <slot/>
        </mds-text>
        <i aria-hidden="true" class="svg icon" innerHTML={miBaselineNavigateNext}/>
      </Host>
    )
  }

}
