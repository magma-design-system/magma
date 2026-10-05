import { Component, Element, h, Host, Method, Prop, State, Watch } from '@stencil/core';
import { IconsSetService } from './services/icons-set.service';
import { isIconFormatIsBase64, isIconFormatIsSVG, BASE64_SVG_ICON } from '@common/icon';

/**
 * @part svg - The svg container of the icon
 */

@Component({
  tag: 'mds-icon',
  styleUrl: 'mds-icon.css',
  shadow: true,
})
export class MdsIcon {
  @State() svgHTML: string;

  /**
   * The name of the icon or a base64 string to render it as an svg
   */
  @Prop({ reflect: true }) readonly name!: string;

  @State() _iconHref: string;

  @Element() hostElement: HTMLMdsIconElement;

  // Each update supersedes the ones still loading: only the latest one sets the svg
  private lastUpdate = 0;

  private wasDisconnected = false;

  private readonly onSvgPathUpdate = (): void => {
    this.updateIcon();
  };

  connectedCallback(): void {
    IconsSetService.registerListener(this.onSvgPathUpdate);
    // the svg path may have changed while the icon was out of the page
    if (this.wasDisconnected) {
      this.wasDisconnected = false;
      this.updateIcon();
    }
  }

  disconnectedCallback(): void {
    IconsSetService.unregisterListener(this.onSvgPathUpdate);
    this.wasDisconnected = true;
  }

  componentWillLoad(): void {
    this.updateIcon();
  }

  private convertBase64ToSvg = (): string => {
    const svgBase64 = this.name.replace(BASE64_SVG_ICON, '').replace(/=/i, '');
    return atob(svgBase64);
  };

  /**
   * Set the path to the directory of svg files
   * @param svgPath path to the directory of svg files
   */
  @Method()
  async setSvgPath(svgPath: string): Promise<void> {
    IconsSetService.setSvgPath(svgPath);
    return Promise.resolve();
  }

  @Watch('name')
  async updateIcon(): Promise<void> {
    const update = ++this.lastUpdate;
    // `name` is undefined (or null) at runtime when the attribute is missing or removed
    if ((this.name ?? '') === '') {
      this.svgHTML = '';
      return Promise.resolve();
    }

    if (isIconFormatIsBase64(this.name)) {
      this.svgHTML = this.convertBase64ToSvg();
      return Promise.resolve();
    }

    if (isIconFormatIsSVG(this.name)) {
      this.svgHTML = this.name;
      return Promise.resolve();
    }

    const svgHTML = await IconsSetService.fetchSvg(this.name);
    if (update === this.lastUpdate) {
      this.svgHTML = svgHTML;
    }
  }

  render() {
    return (
      <Host>
        {this.svgHTML && <i aria-hidden="true" class="icon" part="svg" innerHTML={this.svgHTML} />}
      </Host>
    );
  }
}
