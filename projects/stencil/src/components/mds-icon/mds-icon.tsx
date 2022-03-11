import { Component, Element, h, Host, Method, Prop, State, Watch } from '@stencil/core'
import { IconsSetService } from './services/icons-set.service'

@Component({
  tag: 'mds-icon',
  styleUrl: 'mds-icon.css',
  shadow: true,
})
export class MdsIcon {

  /**
   * The name of the icon.
   */
  @Prop({ reflect: true }) readonly name!: string

  @State() _iconHref: string

  @Element() hostElement: HTMLMdsIconElement

  static readonly _svgPathKey = 'mdsIconSvgPath'

  componentWillLoad (): void {
    this.updateIconHref()
  }

  static setSvgPathStatic (path: string): void {
    IconsSetService.setSvgPath(path)
  }

  @Method()
  async setSvgPath (svgPath: string): Promise<void> {
    IconsSetService.setSvgPath(svgPath)
    this.updateIconHref()
  }

  @Watch('name')
  async updateIconHref (): Promise<void> {
    const svgPath = IconsSetService.getSvgPath() || window.sessionStorage.getItem(MdsIcon._svgPathKey)
    this._iconHref = svgPath && !this.name.startsWith('http') ? window.location.origin.concat(svgPath.concat(this.name).concat('.svg')) : this.name
    const svgHTML = await IconsSetService.fetchSvg(this._iconHref)

    if (svgHTML !== '') this.hostElement.shadowRoot.innerHTML = svgHTML
  }

  render () {
    return (
      <Host></Host>
    )
  }
}
