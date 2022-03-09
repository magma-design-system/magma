import { Component, h, Host, Method, Prop, State, Watch } from '@stencil/core'
import { IconsSetService } from './services/icons-set.service'

import 'external-svg-loader'

@Component({
  tag: 'mds-icon-svg',
  styleUrl: 'mds-icon-svg.css',
  shadow: false,
})
export class MdsIconSvg {

  /**
   * The name of the icon.
   */
  @Prop({ reflect: true }) readonly name!: string

  @State() _iconHref: string

  static readonly _svgPathKey = 'mdsIconSvgPath'

  static setSvgPathStatic (path: string): void {
    IconsSetService.setSvgPath(path)
  }

  @Method()
  async setSvgPath (svgPath: string): Promise<void> {
    IconsSetService.setSvgPath(svgPath)
    this.updateIconHref()
  }

  @Watch('name')
  updateIconHref (): void {
    const svgPath = IconsSetService.getSvgPath() || window.sessionStorage.getItem(MdsIconSvg._svgPathKey)
    this._iconHref = svgPath && !this.name.startsWith('http') ? window.location.origin.concat(svgPath.concat(this.name).concat('.svg')) : this.name
  }

  componentWillLoad (): void {
    this.updateIconHref()
  }

  render () {
    return (
      <Host>
        <svg data-src={this._iconHref} height="24" width="24" data-cache="disabled"></svg>
      </Host>
    )
  }

}
