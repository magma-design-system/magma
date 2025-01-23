import { Component, Host, h, Element, Prop } from '@stencil/core'
import { TreeAppearance } from '@type/tree'

@Component({
  tag: 'mds-tree',
  styleUrl: 'mds-tree.css',
  shadow: true,
})
export class MdsTree {

  @Element() private host: HTMLMdsTreeElement
  private elements:Node[]

  /**
   * Specifies if the branches depth decorations are visible.
   */
  @Prop({ reflect: true }) readonly appearance: TreeAppearance = 'depth'

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
