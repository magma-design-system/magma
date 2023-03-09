import { Component, Host, h, Prop } from '@stencil/core'
import { ExtensionSuffixType } from './meta/types'
import { fileFormatsVariant } from './meta/variants'
import { fileExtensionsDictionary } from './meta/dictionary'
import { ThemeFullVariantType } from '@type/variant'

@Component({
  tag: 'mds-file',
  styleUrl: 'mds-file.css',
  shadow: true,
})
export class MdsFile {

  /**
   * Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen
   */
  @Prop() readonly suffix?: ExtensionSuffixType

  /**
   * Overrides the default filetype description
   */
  @Prop() readonly description?: string

  /**
   * The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary
   */
  @Prop() readonly filename: string

  /**
   * The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image
   */
  @Prop() readonly preview?: string

  private sanitizeFilename = () => {
    if (this.filename === undefined ) {
      throw console.error('Attribute "filename" is undefined.')
    }
    if (this.filename.includes('/')) {
      return this.filename.split('/').pop()
    }
    return this.filename
  }

  private sanitizeSuffix = () => {
    const filename = this.sanitizeFilename()
    if (filename.includes('.')) {
      return filename.split('.').pop()
    }
    return filename
  }

  private getName = () => {
    const filename = this.sanitizeFilename()
    if (filename.includes('.')) {
      return filename.split('.')[0]
    }
    return filename
  }

  private getSuffix = () => {
    const suffix = this.sanitizeSuffix()
    const filename = this.sanitizeFilename()
    if (this.suffix !== null && this.suffix !== undefined) {
      return this.suffix.toLowerCase()
    }
    if (suffix !== filename) {
      return suffix
    }
    return null
  }

  private getExtensionInfos = () => {
    const suffix = this.getSuffix() !== null ? this.getSuffix().toLowerCase() : 'default'
    return fileExtensionsDictionary[suffix] !== undefined ? fileExtensionsDictionary[suffix] : fileExtensionsDictionary.default
  }

  render () {
    const { format, description } = this.getExtensionInfos()
    const { variant, color, icon, iconBackground } = fileFormatsVariant[format]
    return (
      <Host tabindex="0">
        <div class={`preview ${color} ${iconBackground}`}>
          { this.preview !== undefined
            ? <div class="image-preview" style={{ backgroundImage: `url(${this.preview})` }}></div>
            : <mds-icon name={icon}/>
          }
        </div>
        <div class="info">
          <div class="filename" title={ this.filename }>
            <mds-text typography="h6" class="name">{ this.getName() }</mds-text>
            { this.suffix === undefined && this.getSuffix() && <mds-text typography="h6" class="extension">.{ this.getSuffix() }</mds-text> }
          </div>
          <div class="detail">
            { this.getSuffix() && <mds-badge variant={variant as ThemeFullVariantType} tone="quiet" class="suffix">{ this.getSuffix() }</mds-badge> }
            <mds-text typography="caption" class="description" title={ this.description || description }>{ this.description || description }</mds-text>
          </div>
        </div>
      </Host>
    )
  }
}
