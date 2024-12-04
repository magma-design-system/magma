import { Component, Element, h, Host, Method, Prop, State, Watch } from '@stencil/core'
import { IconsSetService } from './services/icons-set.service'
import { isIconFormatIsBase64, isIconFormatIsSVG, BASE64_SVG_ICON } from '@common/icon'

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

  componentWillLoad (): void {
    this.updateIcon()
    IconsSetService.registerListener(() => this.updateIcon())
  }

  private convertBase64ToSvg = (): string => {
    const svgBase64 = this.name.replace(BASE64_SVG_ICON, '').replace(/\=/i, '')
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

    if (isIconFormatIsBase64(this.name)) {
      this.svgHTML = this.convertBase64ToSvg()
      return Promise.resolve()
    }

    if (isIconFormatIsSVG(this.name)) {
      this.svgHTML = this.name
      return Promise.resolve()
    }

    this.svgHTML = await IconsSetService.fetchSvg(this.name)
  }

  render () {
    return (
      <Host>
        { this.svgHTML && <i aria-hidden="true" class="icon" part="svg" innerHTML={this.svgHTML} /> }
      </Host>
    )
  }
}
