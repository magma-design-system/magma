import { Component, Host, h, Element } from '@stencil/core'

@Component({
  tag: 'mds-tree',
  styleUrl: 'mds-tree.css',
  shadow: true,
})
export class MdsTree {

  @Element() private host: HTMLMdsTreeElement
  private elements:Node[]

  private updateElements = (): void => {
    this.elements = this.host.shadowRoot?.querySelectorAll('slot')[0]?.assignedNodes() as Node[]
    this.updateZIndex()
  }

  private updateZIndex = (): void => {
    this.elements.forEach((element, index) => {
      (element as HTMLElement).style.zIndex = `${this.elements.length - index}`
    })
  }

  render () {
    return (
      <Host>
        <slot onSlotchange={this.updateElements}></slot>
      </Host>
    )
  }
}
