import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { MdsPaginatorEventDetail } from './meta/event-detail'
import miBaselineArrowBack from '@icon/mi/baseline/arrow-back.svg'
import miBaselineArrowForward from '@icon/mi/baseline/arrow-forward.svg'

@Component({
  tag: 'mds-paginator',
  styleUrl: 'mds-paginator.css',
  shadow: true,
})
export class MdsPaginator {

  @Element() private element: HTMLMdsPaginatorElement

  /**
   * Specifies the number of total pages to be handled
   */
  @Prop() readonly pages: number = 0

  /**
   * Specifies the current page selected in the paginator
   */
  @Prop({ mutable: true, reflect: true }) currentPage = 1

  componentDidLoad (): void {
    setTimeout(() => {
      this.goToPage(this.currentPage)
    }, 10)
  }

  /**
   * Emits when a page is changed
   */
  @Event({ eventName: 'mdsPaginatorChange' }) pageChangedEvent: EventEmitter<MdsPaginatorEventDetail>

  private scrollPage = (index: number): void => {
    const elementIndex = index
    const pagesElement = this.element.shadowRoot?.querySelector<HTMLDivElement>('.pages')
    const pagesItems = pagesElement?.querySelectorAll<HTMLMdsPaginatorItemElement>('mds-paginator-item')

    if (!pagesElement || !pagesItems) return

    if (elementIndex < 0) {
      pagesElement.scrollLeft = 0
      return
    }

    if (elementIndex > pagesItems.length - 1) {
      const pageItem = pagesItems[pagesItems.length - 1]
      pagesElement.scrollLeft = pageItem.offsetLeft - pagesElement.offsetLeft
      return
    }

    const pageItem = pagesItems[elementIndex]
    pagesElement.scrollLeft = pageItem.offsetLeft - pagesElement.offsetLeft - (pagesElement.offsetWidth / 2) + (pageItem.offsetWidth / 2)
  }

  private focus = (ev: MouseEvent): void => {
    const pagesElement = this.element.shadowRoot?.querySelector<HTMLDivElement>('.pages')
    const pagesItems = pagesElement?.querySelectorAll<HTMLMdsPaginatorItemElement>('mds-paginator-item')
    if (pagesItems && ev.target) {
      const elements = Array.from(pagesItems)
      const index = elements.indexOf(ev.target as HTMLMdsPaginatorItemElement)
      this.scrollPage(index)
    }
  }

  private goToPage = (selectedPage: number, caller?: HTMLMdsPaginatorItemElement): void => {
    if (selectedPage < 1 || selectedPage > this.pages) {
      return
    }
    this.currentPage = selectedPage
    if (this.pages > 2) {
      this.scrollPage(this.currentPage - 2)
    }
    this.pageChangedEvent.emit({ page: this.currentPage, caller })
  }

  render () {
    return (
      <Host>
        <mds-paginator-item class="item-icon" icon={miBaselineArrowBack} disabled={this.currentPage === 1} onClick={ev => this.goToPage(this.currentPage - 1, ev.target as HTMLMdsPaginatorItemElement)}/>
        { this.pages > 0 && <mds-paginator-item class="item-first" selected={this.currentPage === 1} onClick={ev => this.goToPage(1, ev.target as HTMLMdsPaginatorItemElement)}>1</mds-paginator-item>}
        { this.pages > 2 &&
          <div class="pages">
            { Array.from(Array(this.pages - 2).keys()).map( i => <mds-paginator-item key={i} class="item" selected={this.currentPage === i + 2} onClick={ev => this.goToPage(i + 2, ev.target as HTMLMdsPaginatorItemElement)} onFocus={this.focus}>{ i + 2 }</mds-paginator-item>) }
          </div>
        }
        { this.pages > 1 && <mds-paginator-item class="item-last" selected={this.currentPage === this.pages} onClick={ev => this.goToPage(this.pages, ev.target as HTMLMdsPaginatorItemElement)}>{ this.pages }</mds-paginator-item>}
        <mds-paginator-item class="item-icon" icon={miBaselineArrowForward} disabled={this.currentPage === this.pages} onClick={ev => this.goToPage(this.currentPage + 1, ev.target as HTMLMdsPaginatorItemElement)}/>
      </Host>
    )
  }

}
