import { Component, Element, Event, EventEmitter, Listen, Host, h, Prop, State, Method } from '@stencil/core'
import miBaselineArrowBack from '@icon/mi/baseline/arrow-back.svg'
import { MdsBreadcrumbEventDetail } from './meta/event-detail'
import { MdsBreadcrumbItemEventDetail } from '@component/mds-breadcrumb-item/meta/event-detail'
import { KeyboardManager } from '@common/keyboard-manager'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `mds-breadcrumb-item` element/s.
 */

@Component({
  tag: 'mds-breadcrumb',
  styleUrl: 'mds-breadcrumb.css',
  shadow: true,
})
export class MdsBreadcrumb {

  @Element() private element: HTMLMdsBreadcrumbElement
  private kb = new KeyboardManager()
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.element)
  }

  /**
   * Choose to display or not the back arrow button
   */
  @Prop() readonly back?: boolean = true

  /**
   * Emits when the breadcrumb is changed
   */
  @Event({ eventName: 'mdsBreadcrumbChange' }) changedEvent: EventEmitter<MdsBreadcrumbEventDetail>

  private queryItems = ():NodeListOf<HTMLMdsBreadcrumbItemElement> =>
    this.element.querySelectorAll<HTMLMdsBreadcrumbItemElement>('mds-breadcrumb-item')

  private updateBackButton = (id: number): void => {
    if (!this.back) return
    const backElement = this.element.shadowRoot?.querySelector('.back') as HTMLElement
    if (id === 0) {
      backElement.classList.add('disabled')
      this.kb.detachClickBehavior()
      return
    }
    backElement.classList.remove('disabled')
    this.kb.attachClickBehavior()
  }

  componentDidLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `item-${key}`)

    const item = this.element.querySelector<HTMLMdsBreadcrumbItemElement>('mds-breadcrumb-item[selected]')
    if (!item || item.id === 'item-0' ) {
      this.updateBackButton(0)
    }

    if (this.back) {
      const backElement = this.element.shadowRoot?.querySelector('.back') as HTMLElement
      this.kb.addElement(backElement)
      this.kb.attachClickBehavior()
    }
  }

  componentDidUpdate (): void {
    if (this.back) {
      const backElement = this.element.shadowRoot?.querySelector('.back') as HTMLElement
      this.kb.addElement(backElement)
      this.kb.attachClickBehavior()
      return
    }
    this.kb.detachClickBehavior()
  }

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  disconnectedCallback (): void {
    this.kb.detachClickBehavior()
  }

  @Listen('mdsBreadcrumbItemSelect')
  activedEventHandler (event: CustomEvent<MdsBreadcrumbItemEventDetail>): void {
    const items = this.queryItems()
    let selectedId = 0

    items.forEach((item, key) => {
      item.selected = `item-${key}` === event.detail.id && (event.detail.selected)
      if (item.selected) {
        selectedId = key
      }
    })
    this.updateBackButton(selectedId)
    this.onChanged(selectedId, event.target as HTMLMdsBreadcrumbItemElement)
  }

  private togglePrevious = (): void => {
    const item = this.element.querySelector<HTMLMdsBreadcrumbItemElement>('mds-breadcrumb-item[selected]')
    if (!item) return
    const id = Number(item.id.replace('item-', ''))
    const items = this.queryItems()
    let selectedId = 0

    items.forEach((item, key) => {
      item.selected = key === id - 1
      if (item.selected) {
        selectedId = key
      }
    })

    this.updateBackButton(selectedId)
    this.onChanged(selectedId, item)
  }

  private onChanged = (id: number, caller: HTMLMdsBreadcrumbItemElement): void => {
    this.changedEvent.emit({ id: id.toString(), caller })
  }

  render () {
    return (
      <Host>
        { this.back &&
          <mds-button title={this.t.get('back')} class="back" icon={miBaselineArrowBack} onClick={ this.togglePrevious }></mds-button>
        }
        <slot/>
      </Host>
    )
  }
}
