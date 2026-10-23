import { Component, Host, h, Element, Prop, Watch } from '@stencil/core';
import { observeChildren, queryChildrenByTag } from '@common/slot';
import { TreeActions, TreeAppearance, TreeIcon } from '@type/tree';
import { TypographyTruncateType } from '@type/text';
import { ButtonIconPositionType } from '@type/button';

/**
 * @slot - Add `mds-tree-item` element/s.
 * @category navigation
 */

@Component({
  tag: 'mds-tree',
  styleUrl: 'mds-tree.css',
  shadow: true,
})
export class MdsTree {
  @Element() private host: HTMLMdsTreeElement;
  private elements: HTMLElement[] = [];
  private childrenElements: HTMLMdsTreeItemElement[] = [];
  // the items the tree has handed its props to
  private readonly syncedItems = new WeakSet<HTMLMdsTreeItemElement>();

  /**
   * Specifies if the branches depth decorations are visible.
   */
  @Prop({ reflect: true }) readonly appearance: TreeAppearance = 'depth';

  /**
   * Has no effect on the tree: `async` is read on each `mds-tree-item`.
   * @deprecated Set `async` on the items that load their children on demand. Goes in the next
   * major.
   */
  @Prop({ reflect: true }) readonly async?: boolean;

  /**
   * Names the tree for assistive technologies: the tree is a list of its items, and the label
   * is what that list is called
   */
  @Prop() readonly label: string;

  /**
   * Specifies the toggle icon of the element
   */
  @Prop({ reflect: true }) readonly toggle: TreeIcon = 'chevron';

  /**
   * Specifies the toggle icon position of the element
   */
  @Prop({ reflect: true }) readonly togglePosition: ButtonIconPositionType = 'left';

  /**
   * Specifies if the tree is expanded.
   */
  @Prop({ mutable: true, reflect: true }) expanded?: boolean;

  /**
   * Truncate the text of the element on one single line.
   */
  @Prop({ reflect: true }) readonly truncate: TypographyTruncateType = 'word';

  /**
   * Show actions on the every tree item on hover or by default.
   */
  @Prop({ reflect: true }) readonly actions?: TreeActions = 'auto';

  private updateChildrenExpanded = (newValue: boolean): void => {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      if (element.async) return;
      element.expanded = newValue;
    });
  };

  @Watch('expanded')
  handleExpandedChange(newValue: boolean): void {
    this.updateChildrenExpanded(newValue);
  }

  private updateChildrenToggle = (newValue: TreeIcon): void => {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      element.toggle = newValue;
    });
  };

  @Watch('toggle')
  handleToggleChange(newValue: TreeIcon): void {
    this.updateChildrenToggle(newValue);
  }

  private updateChildrenTogglePosition = (newValue: ButtonIconPositionType): void => {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      element.togglePosition = newValue;
    });
  };

  @Watch('togglePosition')
  handleTogglePositionChange(newValue: ButtonIconPositionType): void {
    this.updateChildrenTogglePosition(newValue);
  }

  private updateChildrenAppearance = (newValue: TreeAppearance): void => {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      element.appearance = newValue;
    });
  };

  @Watch('appearance')
  handleAppearanceChange(newValue: TreeAppearance): void {
    this.updateChildrenAppearance(newValue);
  }

  @Watch('actions')
  handleActionsChange(): void {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      void element.refreshActions();
    });
  }

  private updateChildrenTruncate = (newValue: TypographyTruncateType): void => {
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      element.truncate = newValue;
    });
  };

  @Watch('truncate')
  handleTruncateChange(newValue: TypographyTruncateType): void {
    this.updateChildrenTruncate(newValue);
  }

  /* assignedNodes() hands back the whitespace between the items as text nodes, and a text
   * node has no style: the stacking order threw on the first tree written across more than
   * one line, which is every tree a consumer actually writes. assignedElements() is the
   * elements-only half of the same API. */

  private updateElements = (): void => {
    this.elements = (this.host.shadowRoot?.querySelector('slot')?.assignedElements() ??
      []) as HTMLElement[];
    this.updateZIndex();
  };

  private updateZIndex = (): void => {
    this.elements.forEach((element, index) => {
      element.style.zIndex = `${this.elements.length - index}`;
    });
  };

  /**
   * Hands the props of the tree to its items, on load and to the items that arrive later, a branch
   * loaded on demand: the items already there keep the state the user gave them. The items were
   * read once, on load, and the `expanded` of load opened nothing (#826).
   */
  private syncItems = (): void => {
    this.childrenElements = Array.from(this.host.querySelectorAll('mds-tree-item'));
    this.childrenElements.forEach((element: HTMLMdsTreeItemElement) => {
      if (this.syncedItems.has(element)) return;
      this.syncedItems.add(element);
      element.truncate = this.truncate;
      element.toggle = this.toggle;
      element.togglePosition = this.togglePosition;
      element.appearance = this.appearance;
      if (this.expanded !== undefined && !element.async) element.expanded = this.expanded;
    });
    (queryChildrenByTag(this.host, 'mds-tree-item') as HTMLMdsTreeItemElement[]).forEach(
      (element: HTMLMdsTreeItemElement) => {
        element.depth = 0;
      },
    );
  };

  componentWillLoad(): void {
    this.syncItems();
    // the observer stays on the host when it moves, and goes with it
    observeChildren(this.host, this.syncItems);
  }

  render() {
    return (
      // a list of lists: each item is an entry, and the items of an open branch are a list
      // inside it, so a screen reader tells the level and the size of every branch. Not a
      // role="tree", which promises the arrow keys and leaves no room for the actions of an item
      <Host aria-label={(this.label ?? '') !== '' ? this.label : undefined} role="list">
        <slot onSlotchange={this.updateElements}></slot>
      </Host>
    );
  }
}
