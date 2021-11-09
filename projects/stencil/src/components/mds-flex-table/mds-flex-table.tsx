import { Component, Element, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core'
@Component({
  tag: 'mds-flex-table',
  styleUrl: 'mds-flex-table.css',
  shadow: true,
})
export class MdsFlexTable {

  @Element() el: HTMLMdsFlexTableElement

  /**
   * Specifies if the table row are higlighted on mouseover event
   */
  @Prop() readonly interactive?: boolean

  /**
   * Specifies the template for flex children elements
   */
  @Prop() readonly template?: string

  /**
   * Dispatces when interactive property changes
   */
  @Event({ composed: true }) flexTableInteractive: EventEmitter<boolean>

  /**
   * Dispatces when template property changes
   */
  @Event({ composed: true }) flexTableTemplateChanged: EventEmitter<string>

  @Watch('interactive')
  onTableInteractive (): void {
    this.flexTableInteractive.emit(this.interactive)
  }

  @Watch('template')
  onTemplateChanged (): void {
    this.flexTableTemplateChanged.emit(this.template)
  }

  componentDidLoad ():void {
    this.flexTableInteractive.emit(this.interactive)
    this.flexTableTemplateChanged.emit(this.template)
  }

  render () {
    return (
      <Host>
        <div class="flex-table" role="grid">
          <slot/>
        </div>
      </Host>
    )
  }

}
