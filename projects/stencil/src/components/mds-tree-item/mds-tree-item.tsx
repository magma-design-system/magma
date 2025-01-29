import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import clsx from 'clsx'
import miBaselineChevronRight from '@icon/mi/baseline/chevron-right.svg'
import mdiFolderOpen from '@icon/mdi/folder-open.svg'
import miBaselineFolderClosed from '@icon/mi/baseline/folder.svg'
// import { ButtonIconPositionType } from '@type/button'
import { Component, Host, h, Prop, Element, State, Method, Watch } from '@stencil/core'
import { Locale } from '@common/locale'
import { TreeIcon } from '@type/tree'
import { hasSlottedElements } from '@common/slot'
import { TypographyTruncateType } from '@type/text'

@Component({
  tag: 'mds-tree-item',
  styleUrl: 'mds-tree-item.css',
  shadow: true,
})
export class MdsTreeItem {

  private hasActions: boolean
  // private togglePosition?: ButtonIconPositionType = 'left'
  private childrenElement: HTMLElement
  @State() hasChildren: boolean = false
  @State() currentToggleIcon: string
  @State() await: boolean
  @Element() private host: HTMLMdsTreeItemElement
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  /**
   * Specifies the tree should be opened asynchronously when after the click, .
   */
  @Prop({ reflect: true }) readonly async?: boolean

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly label: string

  /**
   * Specifies the icon of the element
   */
  @Prop({ mutable: true, reflect: true }) toggle?: TreeIcon // = 'chevron'

  /**
   * Specifies if the tree is expanded.
   */
  @Prop({ mutable: true, reflect: true }) expanded?: boolean

  /**
   * Truncate the text of the element on one single line.
   */
  @Prop({ mutable: true, reflect: true }) truncate?: TypographyTruncateType = 'word'

  /**
   * The icon displayed in the button
   */
  @Prop() readonly icon?: string

  // /**
  //  * Show actions on the element.
  //  */
  // @Prop({ reflect: true }) readonly actions?: 'visible' | 'auto' = 'auto'

  @Watch('toggle')
  handleIconChange (): void {
    this.updateToggleIcon()
  }

  @Watch('expanded')
  handleExpandedChange (newValue: boolean): void {
    if (newValue) {
      this.childrenElement.classList.remove('children--hidden')
    }
  }

  private getParentAttribute = (element: HTMLElement, parent: string, attribute: string, defaultValue?: string): string | undefined => {
    const attributeValue = element.closest(parent)?.getAttribute(attribute)
    return attributeValue ? attributeValue : defaultValue ?? undefined
  }

  private updateAttrubtes = (): void => {
    this.toggle = this.getParentAttribute(this.host, 'mds-tree', 'toggle', 'chevron') as TreeIcon
    // this.togglePosition = this.getParentAttribute(this.host, 'mds-tree', 'toggle-position', 'left') as ButtonIconPositionType
    this.truncate = this.getParentAttribute(this.host, 'mds-tree', 'truncate', 'all') as TypographyTruncateType
  }

  private checkChildrenTransitionEnd = (): void => {
    if (!this.childrenElement.classList.contains('children--expanded')) {
      this.childrenElement.classList.add('children--hidden')
    }
  }

  private updateToggleIcon = (): void => {
    if (this.toggle === 'folder') {
      this.currentToggleIcon = this.expanded ? mdiFolderOpen : miBaselineFolderClosed
      return
    }
    this.currentToggleIcon = miBaselineChevronRight
  }

  private onClick = (): void => {
    if (this.async && !this.expanded) {
      this.idle()
      return
    }

    this.updateToggle()
  }

  private idle = (): void => {
    this.await = true
    // evento onMdsTreeAwait
  }

  private updateToggle = (): void => {
    this.expanded = !this.expanded
    this.updateToggleIcon()
  }

  @Method()
  async open (): Promise<void> {
    this.expanded = true
    this.updateToggleIcon()
  }

  componentWillLoad (): void {
    this.hasActions = this.host.querySelector('[slot="action"]') !== null
  }

  componentDidLoad (): void {
    this.updateToggleIcon()
    this.updateAttrubtes()
    this.language = this.t.lang(this.host)
    this.childrenElement = this.host.shadowRoot?.querySelector('.children') as HTMLElement
    this.childrenElement.addEventListener('transitionend', this.checkChildrenTransitionEnd)
    this.hasChildren = hasSlottedElements(this.host)
  }

  disconnectedCallback (): void {
    this.childrenElement.removeEventListener('transitionend', this.checkChildrenTransitionEnd)
  }

  render () {
    return (
      <Host>
        <div class={clsx('header', this.hasChildren && 'header--has-children')}>
          <div class="tree-node">
            <div class="tree-dot"></div>
          </div>
          <div class="toggle-icon">
            <mds-button await={this.await} onClick={this.onClick.bind(this)} icon={!this.await ? this.currentToggleIcon : undefined} title={ this.t.get(this.expanded ? 'collapse' : 'expand', { label: this.label }) } variant="dark" tone="quiet" size="sm"/>
          </div>
          <div class="title">
            <mds-button class="label-action" icon={this.icon} onClick={this.onClick.bind(this)} variant="dark" tone="quiet" truncate={this.truncate}>{ this.label }</mds-button>
            { this.hasActions &&
              <div class="actions-container">
                <div class="actions" part="actions">
                  <slot name="action"></slot>
                </div>
              </div>
            }
          </div>
        </div>
        <div class={clsx('children', this.hasChildren && 'children--has-children', this.expanded && 'children--expanded')}>
          <slot></slot>
        </div>
      </Host>
    )
  }
}
