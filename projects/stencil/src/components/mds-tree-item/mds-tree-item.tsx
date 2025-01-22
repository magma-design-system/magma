import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import clsx from 'clsx'
import miBaselineChevronRight from '@icon/mi/baseline/chevron-right.svg'
// import miBaselineFolderOpen from '@icon/mi/baseline/folder-open.svg'
import mdiFolderOpen from '@icon/mdi/folder-open.svg'
import miBaselineFolderClosed from '@icon/mi/baseline/folder.svg'
import { ButtonIconPositionType } from '@type/button'
import { Component, Host, h, Prop, Element, State, Method, Watch } from '@stencil/core'
import { Locale } from '@common/locale'
import { TreeAppearance, TreeIcon } from './meta/types'
import { hasSlottedElements } from '@common/slot'
import { TypographyTruncateType } from '@type/text'

@Component({
  tag: 'mds-tree-item',
  styleUrl: 'mds-tree-item.css',
  shadow: true,
})
export class MdsTreeItem {

  private hasActions: boolean
  @State() hasChildren: boolean = true
  @State() currentIcon: string
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
  @Prop({ reflect: true }) readonly icon: TreeIcon = 'chevron'

  /**
   * Specifies the icon position of the element
   */
  @Prop({ reflect: true }) readonly iconPosition: ButtonIconPositionType = 'left'

  /**
   * Specifies if the branches depth decorations are visible.
   */
  @Prop({ reflect: true }) readonly appearance: TreeAppearance = 'depth'

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

  @Watch('icon')
  handleIconChange (): void {
    this.updateIcon()
  }

  componentWillLoad (): void {
    this.hasActions = this.host.querySelector('[slot="action"]') !== null
    this.updateIcon()
  }

  componentDidLoad (): void {
    this.language = this.t.lang(this.host)
    this.hasChildren = hasSlottedElements(this.host)
  }

  private updateIcon = (): void => {
    if (this.icon === 'folder') {
      this.currentIcon = this.expanded ? mdiFolderOpen : miBaselineFolderClosed
      return
    }
    this.currentIcon = miBaselineChevronRight
  }

  private onClick = (): void => {
    if (this.async && !this.expanded) {
      this.idle()
      return
    }

    this.toggle()
  }

  private idle = (): void => {
    this.await = true
    // evento onMdsTreeAwait
  }

  private toggle = (): void => {
    this.expanded = !this.expanded
    this.updateIcon()
  }

  @Method()
  async open (): Promise<void> {
    this.expanded = true
    this.updateIcon()
  }

  render () {
    return (
      <Host>
        <div class="header">
          <div class="tree-node">
            { this.hasChildren &&
              <mds-button await={this.await} class="toggle-icon" onClick={this.onClick.bind(this)} icon={!this.await ? this.currentIcon : ''} title={ this.t.get(this.expanded ? 'collapse' : 'expand', { label: this.label }) } variant="dark" tone="quiet" size="sm"/>
            }
          </div>
          <div class="title">
            <mds-button class="label-action" onClick={this.onClick.bind(this)} variant="dark" tone="quiet" truncate={this.truncate}>{ this.label }</mds-button>
            { this.hasActions &&
              <div class="actions-container">
                <div class="actions" part="actions">
                  <slot name="action"></slot>
                </div>
              </div>
            }
          </div>
        </div>
        <div class={clsx('children', this.expanded && 'children--expanded', this.hasChildren ?? 'children--empty')}>
          <slot></slot>
        </div>
      </Host>
    )
  }
}
