import { Component, Host, h, Prop, Element, State, Method } from '@stencil/core'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Put `mds-table-cell` element/s.
 */

@Component({
  tag: 'mds-table-row',
  styleUrl: 'mds-table-row.css',
  shadow: true,
})
export class MdsTableRow {

  @Element() host: HTMLMdsTableRowElement
  private actions: HTMLDivElement
  private hasActions: boolean
  private sizerWidth: string
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
    this.t.update()
  }

  @Prop({ reflect: true }) readonly interactive?: boolean

  @Prop({ reflect: true }) readonly overlayActions: boolean

  @Prop({ reflect: true }) readonly selectable?: boolean = undefined

  @Prop({ mutable: true, reflect: true }) selected?: boolean

  @Prop({ reflect: true }) readonly value?: string | number

  componentWillLoad (): void {
    this.language = this.t.lang(this.host)
    this.hasActions = this.host.querySelector('[slot="action"]') !== null
  }

  componentDidLoad (): void {
    if (this.hasActions) {
      this.actions = this.host.shadowRoot?.querySelector('.actions') as HTMLDivElement
      this.sizerWidth = `${this.actions.offsetWidth.toString()}px`
    }
  }

  private handleSelectionChange = (e: CustomEvent): void => {
    this.selected = e.detail.checked
    this.host.closest('mds-table')?.updateSelection()
  }

  render () {
    return (
      <Host role="row">
        { this.selectable &&
          <mds-table-cell class="selection-cell">
            <div class="checkbox-wrapper">
              <mds-input-switch title={this.t.get(this.selected ? 'unselectRow' : 'selectRow')} lang={this.language} type="checkbox" checked={this.selected} onMdsInputSwitchChange={this.handleSelectionChange}></mds-input-switch>
            </div>
          </mds-table-cell>
        }
        <slot/>
        { this.hasActions &&
          <mds-table-cell class="actions-cell">
            <div class="actions-sizer" style={{
              minHeight: '1px',
              maxWidth: this.sizerWidth,
              minWidth: this.sizerWidth,
            }}></div>
            <div class="actions-view">
              <div class="actions" style={{
                marginRight: `calc(${this.sizerWidth} + var(--mds-table-cell-padding))`,
              }}>
                <slot name="action"></slot>
              </div>
            </div>
          </mds-table-cell>
        }
      </Host>
    )
  }

}
