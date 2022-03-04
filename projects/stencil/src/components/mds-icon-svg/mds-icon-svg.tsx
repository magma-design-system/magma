import { Component, h, Host, Method, Prop, State, Watch } from '@stencil/core'
import { IconNameResolverFn } from './meta/icon-set'
import { IconsSetService } from './services/icons-set.service'

@Component({
  tag: 'mds-icon-svg',
  shadow: true,
})
export class MdsIconSvg {

  /**
   * The name of the icon.
   */
  @Prop({ reflect: true }) readonly name!: string

  @State() _iconHref: string

  @Method()
  async setSvgPath (svgPath: string): Promise<void> {
    IconsSetService.setSvgPath(svgPath)
    this.updateIconHref()
  }

  @Watch('name')
  updateIconHref (): void {
    const svgPath = IconsSetService.getSvgPath()
    this._iconHref = svgPath ? svgPath.concat(this.name).concat('.svg') : this.name
  }

  connectedCallback (): void {
    this.updateIconHref()
  }

  render () {
    return (
      <Host>
        <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20">
          <image xlinkHref={this._iconHref} width="100%" height="100%"></image>
        </svg>
      </Host>
    )
  }

}
