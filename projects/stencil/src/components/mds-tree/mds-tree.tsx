import { Component, Host, h, Element, Prop } from '@stencil/core'
import { TreeAppearance, TreeIcon } from '@type/tree'
import { TypographyTruncateType } from '@type/text'
import { ButtonIconPositionType } from '@type/button'

/** TODO
 * Rendere custom le icone degli elementi selezionabili
 *
 * */

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

  /**
   * Specifies the tree should be opened asynchronously when after the click, .
   */
  @Prop({ reflect: true }) readonly async?: boolean

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly label: string

  /**
   * Specifies the toggle icon of the element
   */
  @Prop({ reflect: true }) readonly toggle: TreeIcon = 'chevron'

  /**
   * Specifies the toggle icon position of the element
   */
  @Prop({ reflect: true }) readonly togglePosition: ButtonIconPositionType = 'left'

  /**
   * Specifies if the tree is expanded.
   */
  @Prop({ mutable: true, reflect: true }) expanded?: boolean

  /**
   * Truncate the text of the element on one single line.
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType = 'word'

  /**
   * Show actions on the element.
   */
  @Prop({ reflect: true }) readonly actions?: 'visible' | 'auto' = 'auto'

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
