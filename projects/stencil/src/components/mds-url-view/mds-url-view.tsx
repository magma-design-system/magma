import { Component, Host, h, Prop } from '@stencil/core'

import { LoadingType } from '../../types/loading'

@Component({
  tag: 'mds-url-view',
  styleUrl: 'mds-url-view.css',
  shadow: true,
})
export class MdsUrlView {

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

  render () {
    return (
      <Host>
        <div class="window">
          <header class="header">
            <mds-icon class="browser-icon" name="explore"/>
            <mds-text class="title" typography="caption">
              { this.urlDomain(this.src) }
            </mds-text>
            <mds-icon class="close" name="close"/>
          </header>
          <iframe class="iframe" src={ this.src }/>
        </div>
      </Host>
    )
  }

}
