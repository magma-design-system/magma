import { Component, Element, h, Host, Method, Prop, State, Watch } from '@stencil/core'
import { IconsSetService } from './services/icons-set.service'

/**
 * @part svg - The svg container of the icon
 */

@Component({
  tag: 'mds-icon',
  styleUrl: 'mds-icon.css',
  shadow: true,
})
export class MdsIcon {

  @State() svgHTML: string

  /**
   * The name of the icon or a base64 string to render it as an svg
   */
  @Prop({ reflect: true }) readonly name!: string

  @State() _iconHref: string

  @Element() hostElement: HTMLMdsIconElement

  componentWillLoad = (): void => {
    this.updateIcon()
    IconsSetService.registerListener(() => this.updateIcon())
  }

  private checkIconFormatIsBase64 = (): boolean => {
    return this.name.startsWith('data:image/svg+xml;base64,')
  }

  private checkIconFormatIsSVG = (): boolean => {
    return this.name.startsWith('<svg ')
  }

  private convertBase64ToSvg = (): string => {
    const svgBase64 = this.name.replace('data:image/svg+xml;base64,', '').replace(/\=/i, '')
    return atob(svgBase64)
  }

  static setSvgPathStatic (path: string): void {
    IconsSetService.setSvgPath(path)
  }

  /**
   * Set the path to the directory of svg files
   * @param svgPath path to the directory of svg files
   */
  @Method()
  async setSvgPath (svgPath: string): Promise<void> {
    IconsSetService.setSvgPath(svgPath)
  }

  @Watch('name')
  async updateIcon (): Promise<void> {
    if (!this.name) return Promise.resolve()

    if (this.checkIconFormatIsBase64()) {
      this.svgHTML = this.convertBase64ToSvg()
      return Promise.resolve()
    }

    if (this.checkIconFormatIsSVG()) {
      this.svgHTML = this.name
      return Promise.resolve()
    }

    const svgPath = IconsSetService.getSvgPath() || window.sessionStorage.getItem(IconsSetService._svgPathKey)
    this._iconHref = svgPath && !this.name.startsWith('http') ? window.location.origin.concat(svgPath.concat(this.name).concat('.svg')) : this.name
    this.svgHTML = await IconsSetService.fetchSvg(this._iconHref)
  }

  render () {
    return (
      <Host>
        { this.svgHTML && <i aria-hidden="true" class="icon" part="svg" innerHTML={this.svgHTML} /> }
      </Host>
    )
  }
}
