import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import miBaselineNavigateNext from '@icon/mi/baseline/navigate-next.svg'
import { MdsBreadcrumbItemEventDetail } from './meta/event-detail'
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
   * Choose if the component is selected or not
   */
  @Prop({ mutable: true, reflect: true }) selected?: boolean

  /**
   * Emits when the breadcrumb is active
   */
  @Event({ eventName: 'mdsBreadcrumbItemSelect' }) selectedEvent: EventEmitter<MdsBreadcrumbItemEventDetail>

  private toggle = () => {
    this.selected = !this.selected
    this.selectedEvent.emit({ id: this.element.id, selected: this.selected })
  }

  componentDidLoad ():void {
    const textElement = this.element.shadowRoot?.querySelector('.text') as HTMLElement
    this.km.addElement(textElement)
    this.km.attachClickBehavior()
  }

  componentDidUpdate ():void {
    if (this.selected) {
      this.km.detachClickBehavior()
      return
    }
    this.km.attachClickBehavior()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  /**
 * @slot default - Add mds-breadcrumb-item components here
 */

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
