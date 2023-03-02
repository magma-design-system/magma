import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { LoadingType } from '../../types/loading'
import miBaselineExplore from '@icon/mi/baseline/explore.svg'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import { KeyboardManager } from '@common/keyboard-manager'

@Component({
  tag: 'mds-url-view',
  styleUrl: 'mds-url-view.css',
  shadow: true,
})
export class MdsUrlView {

  @Element() host: HTMLMdsUrlViewElement
  private km = new KeyboardManager()

  /**
   * Specifies if domain is visible on header
   */
  @Prop() readonly domain!: boolean

  /**
   * Specifies the URL to the web page
   */
  @Prop() readonly src!: string

  /**
   * Specifies whether a browser should load an iframe immediately
   * or to defer loading of images until some conditions are met.
   */
  @Prop() readonly loading?: LoadingType = 'lazy'

  private urlDomain = (url: string): string => {
    const domain = new URL(url)
    return domain.hostname.replace('www.', '')
  }

  /**
   * Emits when the url view is closed
   */
  @Event({ bubbles: true, composed: true }) close: EventEmitter<void>

  private closeUrlView = (): void => {
    this.close.emit()
  }

  componentDidLoad = (): void => {
    const close = this.host.shadowRoot.querySelector('.close') as HTMLElement
    this.km.addElement(close)
    this.km.attachClickBehavior()
  }

  disconnectedCallback = (): void => {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host>
        <div class="window">
          <header class="header">
            <i class="svg browser-icon" innerHTML={miBaselineExplore}/>
            { this.domain && <mds-text class="title" typography="caption">
              { this.urlDomain(this.src) }
            </mds-text> }
            <i class="svg close focusable" innerHTML={miBaselineClose} onClick={this.closeUrlView} tabindex="0"/>
          </header>
          <iframe class="iframe" src={ this.src }/>
        </div>
      </Host>
    )
  }

}
