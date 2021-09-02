import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'

@Component({
  tag: 'mds-paginator',
  styleUrl: 'mds-paginator.css',
  shadow: true,
})
export class MdsPaginator {

  @Element() private element: HTMLMdsPaginatorElement;

  /**
   * Specifies the number of total pages to be handled
   */
  @Prop() readonly pages? = 0

  /**
   * Specifies the current page selected in the paginator
   */
  @Prop({ mutable: true, reflect: true }) currentPage? = 1

  /**
   * Emits when a page is changed
   */
  @Event() pageChangedEvent: EventEmitter<number>

  private goToPage = (selectedPage: number): void => {
    if (selectedPage < 1 || selectedPage > this.pages) {
      return
    }
    this.currentPage = selectedPage
    const elementIndex = this.currentPage - 2
    const pagesElement = this.element.shadowRoot.querySelector<HTMLDivElement>('.pages')
    const pagesItems = pagesElement.querySelectorAll<HTMLMdsPaginatorItemElement>('mds-paginator-item')
    if (elementIndex < 0) {
      pagesElement.scrollLeft = 0
      return
    }

    if (elementIndex > pagesItems.length - 1) {
      pagesElement.scrollLeft = pagesElement.offsetWidth
      const pageItem = pagesItems[pagesItems.length - 1]
      pagesElement.scrollLeft = pageItem.offsetLeft - pagesElement.offsetLeft - (pagesElement.offsetWidth / 2) + (pageItem.offsetWidth / 2)
      return
    }
    const pageItem = pagesItems[elementIndex]
    pagesElement.scrollLeft = pageItem.offsetLeft - pagesElement.offsetLeft - (pagesElement.offsetWidth / 2) + (pageItem.offsetWidth / 2)
    this.pageChangedEvent.emit(this.currentPage)
  }

  render () {
    return (
      <Host>
        <mds-paginator-item icon="paginator-previous" disabled={this.currentPage === 1} onClick={() => this.goToPage(this.currentPage - 1)}/>
        { this.pages > 0 && <mds-paginator-item active={this.currentPage === 1} onClick={() => this.goToPage(1)}>1</mds-paginator-item>}
        { this.pages > 2 &&
          <div class="pages">
            { Array.from(Array(this.pages - 2).keys()).map( i => <mds-paginator-item key={i} active={this.currentPage === i + 2} onClick={() => this.goToPage(i + 2)}>{ i + 2 }</mds-paginator-item>) }
          </div>
        }
        { this.pages && <mds-paginator-item active={this.currentPage === this.pages} onClick={() => this.goToPage(this.pages)}>{ this.pages }</mds-paginator-item>}
        <mds-paginator-item icon="paginator-next" disabled={this.currentPage === this.pages} onClick={() => this.goToPage(this.currentPage + 1)}/>
      </Host>
    )
  }

}
