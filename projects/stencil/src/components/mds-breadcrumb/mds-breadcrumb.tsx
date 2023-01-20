import { Component, Element, Listen, Host, h, Prop } from '@stencil/core'
import miBaselineArrowBack from '@icon/mi/baseline/arrow-back.svg'
import { BreadcrumbClickedEvent } from './meta/interface'

@Component({
  tag: 'mds-breadcrumb',
  styleUrl: 'mds-breadcrumb.css',
  shadow: true,
})
export class MdsBreadcrumb {

  @Element() private element: HTMLMdsBreadcrumbElement
  private backButton: HTMLDivElement

  /**
   * Choose to display or not the back arrow button
   */
  @Prop() readonly back?: boolean = true

  private queryItems = ():NodeListOf<HTMLMdsBreadcrumbItemElement> =>
    this.element.querySelectorAll<HTMLMdsBreadcrumbItemElement>('mds-breadcrumb-item')

  componentDidLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `item-${key}`)
    this.backButton = this.element.shadowRoot.querySelector<HTMLDivElement>('.back')
    const item = this.element.querySelector<HTMLMdsBreadcrumbItemElement>('mds-breadcrumb-item[active]')
    if (!item || item.id === 'item-0' ) {
      this.updateBackButton(0)
    }
  }

  @Listen('activedEvent')
  activedEventHandler (event: CustomEvent<BreadcrumbClickedEvent>): void {
    const items = this.queryItems()
    let activeId = 0

    items.forEach((item, key) => {
      item.active = `item-${key}` === event.detail.id && (event.detail.active)
      if (item.active) {
        activeId = key
      }
    })
    this.updateBackButton(activeId)
  }

  private togglePrevious = (): void => {
    const item = this.element.querySelector<HTMLMdsBreadcrumbItemElement>('mds-breadcrumb-item[active]')
    const id = Number(item.id.replace('item-', ''))
    const items = this.queryItems()
    let activeId = 0

    items.forEach((item, key) => {
      item.active = key === id - 1
      if (item.active) {
        activeId = key
      }
    })
    this.updateBackButton(activeId)
  }

  private updateBackButton = (id: number): void => {
    if (id === 0) {
      this.backButton.classList.add('disabled')
      return
    }
    this.backButton.classList.remove('disabled')
  }

  render () {
    return (
      <Host>
        { this.back &&
          <div class="back" onClick={ this.togglePrevious }>
            <i class="svg icon" innerHTML={miBaselineArrowBack}/>
          </div>
        }
        <slot name="breadcrumb-item"/>
      </Host>
    )
  }
}
