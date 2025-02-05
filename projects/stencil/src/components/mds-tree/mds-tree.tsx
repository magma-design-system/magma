import { Component, Host, h, Element, Prop, Watch } from '@stencil/core'
import { TreeActions, TreeAppearance, TreeIcon } from '@type/tree'
import { TypographyTruncateType } from '@type/text'
import { ButtonIconPositionType } from '@type/button'

/**
 * @slot default - Add `mds-tree-item` element/s.
 */

@Component({
  tag: 'mds-tree',
  styleUrl: 'mds-tree.css',
  shadow: true,
})
export class MdsTree {

  @Element() private host: HTMLMdsTreeElement
  private elements:Node[]
  private childrenElements:NodeListOf<HTMLMdsTreeItemElement>

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
  @Prop({ reflect: true }) readonly truncate: TypographyTruncateType = 'word'

  /**
   * Show actions on the every tree item on hover or by default.
   */
  @Prop({ reflect: true }) readonly actions?: TreeActions = 'auto'

  private updateChildrenExpanded = (newValue: boolean): void => {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      if (element.async) return
      element.expanded = newValue
    })
  }

  @Watch('expanded')
  handleExpandedChange (newValue: boolean): void {
    this.updateChildrenExpanded(newValue)
  }

  private updateChildrenToggle = (newValue: TreeIcon): void => {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      element.toggle = newValue
    })
  }

  @Watch('toggle')
  handleToggleChange (newValue: TreeIcon): void {
    this.updateChildrenToggle(newValue)
  }

  private updateChildrenTruncate = (newValue: TypographyTruncateType): void => {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      element.truncate = newValue
    })
  }

  @Watch('truncate')
  handleTruncateChange (newValue: TypographyTruncateType): void {
    this.updateChildrenTruncate(newValue)
  }

  private updateElements = (): void => {
    this.elements = this.host.shadowRoot?.querySelectorAll('slot')[0]?.assignedNodes() as Node[]
    this.updateZIndex()
  }

  private updateZIndex = (): void => {
    this.elements.forEach((element, index) => {
      (element as HTMLElement).style.zIndex = `${this.elements.length - index}`
    })
  }

  componentWillLoad (): void {
    this.childrenElements = this.host.querySelectorAll('mds-tree-item')
    this.updateChildrenTruncate(this.truncate)
    this.updateChildrenToggle(this.toggle)
    const firstLevelElements = this.host.querySelectorAll(':scope > mds-tree-item')

    if (firstLevelElements) {
      firstLevelElements.forEach((element: HTMLMdsTreeItemElement) => {
        element.depth = 0
      })
    }
  }

  render () {
    return (
      <Host>
        <slot onSlotchange={this.updateElements}></slot>
      </Host>
    )
  }
}
