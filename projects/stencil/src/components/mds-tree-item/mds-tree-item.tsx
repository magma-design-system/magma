import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import clsx from 'clsx'
import miBaselineChevronRight from '@icon/mi/baseline/chevron-right.svg'
import mdiFolderOpen from '@icon/mdi/folder-open.svg'
import miBaselineFolderClosed from '@icon/mi/baseline/folder.svg'
import { MdsTreeItemEventDetail } from './meta/event-detail'
import { TreeActions, TreeIcon } from '@type/tree'
import { Component, Host, h, Prop, Element, Event, EventEmitter, State, Method, Watch } from '@stencil/core'
import { Locale } from '@common/locale'
import { TypographyTruncateType } from '@type/text'
import { cssDurationToMilliseconds } from '@common/unit'

/**
 * @slot default - Add `mds-tree-item` element/s.
 * @slot action - Add `mds-button`, `mds-icon` or other types component and HTML element/s.
 * @part actions-container - Selects the wrapper of the container of the actions.
 * @part actions-list - Selects the container of the actions.
 */

@Component({
  tag: 'mds-tree-item',
  styleUrl: 'mds-tree-item.css',
  shadow: true,
})
export class MdsTreeItem {

  private childrenElement: HTMLElement
  private toggleChildrenTimer: NodeJS.Timeout
  private cssToggleChildrenDuration: string
  @State() hasActions: boolean = false
  @State() hasChildren: boolean = false
  @State() currentToggleIcon: string
  @State() await: boolean
  @Element() private readonly host: HTMLMdsTreeItemElement
  private readonly t:Locale = new Locale({
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
   * Show actions on the tree item on hover or by default.
   */
  @Prop({ reflect: true }) readonly actions?: TreeActions

  /**
   * Specifies the tree should be opened asynchronously when after the click.
   */
  @Prop({ reflect: true }) readonly async?: boolean

  //
  // Specifies the tree branch depth, it's internal and it's used by css to remove fitst level elements branch lines.
  //
  @Prop({ reflect: true }) readonly depth?: number

  /**
   * Specifies the label of the tree item
   */
  @Prop() readonly label: string

  /**
   * Specifies the icon of the element
   */
  @Prop({ reflect: true }) toggle?: TreeIcon

  /**
   * Specifies if the tree is expanded.
   */
  @Prop({ mutable: true, reflect: true }) expanded?: boolean

  /**
   * Truncate the text of the element on one single line.
   */
  @Prop({ reflect: true }) truncate?: TypographyTruncateType = 'word'

  /**
   * The icon displayed in the button
   */
  @Prop() readonly icon?: string

  /**
   * Emits when the component expand it's children container
   */
  @Event({ eventName: 'mdsTreeItemExpand' }) expandEvent: EventEmitter<MdsTreeItemEventDetail>

  /**
   * Emits when the component attribute selected is changed
   */
  @Event({ eventName: 'mdsTreeItemCollapse' }) collapsedEvent: EventEmitter<MdsTreeItemEventDetail>

  @Watch('toggle')
  handleIconChange (): void {
    this.updateToggleIcon()
  }

  @Watch('expanded')
  handleExpandedChange (newValue: boolean): void {
    if (newValue) {
      this.childrenElement.classList.remove('children--hidden')
      return
    }
    this.toggleChildrenTimer = setTimeout(() => {
      clearTimeout(this.toggleChildrenTimer)
      this.collapsedEvent.emit({ element: this.host })
    }, cssDurationToMilliseconds(this.cssToggleChildrenDuration))
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
    this.expandEvent.emit({ element: this.host })
  }

  private updateToggle = (): void => {
    this.expanded = !this.expanded
    this.updateToggleIcon()
  }

  private updateCssCustomProperty = (): void => {
    const elementStyles = window.getComputedStyle(this.host)
    this.cssToggleChildrenDuration = elementStyles.getPropertyValue('--mds-dropdown-backdrop-duration')
  }

  @Method()
  async expand (): Promise<void> {
    this.expanded = true
    this.await = false
    this.updateToggleIcon()
  }

  componentWillLoad (): void {
    this.language = this.t.lang(this.host)

    this.updateToggleIcon()

    this.hasActions = !!this.host.querySelector('[slot="action"]')
    this.hasChildren = !!this.host.querySelector('mds-tree-item')
  }

  componentDidLoad (): void {
    this.updateCssCustomProperty()
    this.childrenElement = this.host.shadowRoot?.querySelector('.children') as HTMLElement
    this.childrenElement.addEventListener('transitionend', this.checkChildrenTransitionEnd)
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
            <mds-button class={clsx('label-action', this.await && 'label-action--await')} disabled={this.await} icon={this.icon} onClick={this.onClick.bind(this)} variant="dark" tone="quiet" truncate={this.truncate}>{ this.label }</mds-button>
            <div class={clsx('actions-container', this.hasActions && 'actions-container--has-actions')} part="actions-container">
              <div class="actions" part="actions-list">
                <slot name="action"></slot>
              </div>
            </div>
          </div>
        </div>
        <div class={clsx('children', this.hasChildren && 'children--has-children', this.expanded && 'children--expanded')}>
          <slot></slot>
        </div>
      </Host>
    )
  }
}
