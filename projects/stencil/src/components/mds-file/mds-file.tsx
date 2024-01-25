import { Component, Element, Event, EventEmitter, Host, h, Prop, State } from '@stencil/core'
import { ExtensionSuffixType } from '@type/file-types'
import { MdsFileEventDetail } from './meta/event-detail'
import { ThemeFullVariantType } from '@type/variant'
import { fileExtensionsDictionary } from '@dictionary/file-extensions'
import { fileFormatsVariant } from '@type/variant-file-format'
import { MD5 } from 'crypto-js'
import miBaselineFileDownloadDone from '@icon/mi/baseline/file-download-done.svg'

// https://stackoverflow.com/questions/1106377/detect-when-a-browser-receives-a-file-download

@Component({
  tag: 'mds-file',
  styleUrl: 'mds-file.css',
  shadow: true,
})
export class MdsFile {

  @Element() private host: HTMLMdsFileElement

  @State() private wasDownloaded = false

  /**
   * Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen
   */
  @Prop() readonly suffix?: ExtensionSuffixType

  /**
   * Overrides the default filetype description
   */
  @Prop() readonly description?: string

  /**
   * Sets a label which is shown when the file is downloaded
   */
  @Prop() readonly downloadedLabel?: string = 'Hai già scaricato questo file'

  /**
   * The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary
   */
  @Prop() readonly filename: string

  /**
   * The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image
   */
  @Prop() readonly preview?: string

  /**
   * Emits when the component is clicked, returning file infos
   */
  @Event({ eventName: 'mdsFileDownload' }) downloadedEvent: EventEmitter<MdsFileEventDetail>

  private sanitizeFilename = () => {
    if (this.filename === undefined ) {
      throw console.error('Attribute "filename" is undefined.')
    }
    if (this.filename.includes('/')) {
      return this.filename.split('/').pop() ?? ''
    }
    return this.filename
  }

  private sanitizeSuffix = () => {
    const filename = this.sanitizeFilename()
    if (filename.includes('.')) {
      return filename.split('.').pop() ?? ''
    }
    return filename
  }

  private getName = () => {
    const filename = this.sanitizeFilename()
    if (filename.includes('.')) {
      return filename.split('.')[0] ?? ''
    }
    return filename
  }

  private getSuffix = (): string => {
    const suffix = this.sanitizeSuffix()
    const filename = this.sanitizeFilename()
    if (this.suffix !== null && this.suffix !== undefined) {
      return this.suffix.toLowerCase()
    }
    if (suffix !== filename) {
      return suffix
    }
    return 'default'
  }

  private getExtensionInfos = () => {
    const suffix = this.getSuffix().toLocaleLowerCase()
    return fileExtensionsDictionary[suffix] !== undefined ? fileExtensionsDictionary[suffix] : fileExtensionsDictionary.default
  }

  private handleOnClick = (): void => {
    const { format, description } = this.getExtensionInfos()
    this.downloadedEvent.emit({ description: this.description ?? description, extension: this.getSuffix(), filename: this.filename, target: this.host, type: format })
    localStorage.setItem(`mds-file/${MD5(this.filename).toString()}`, 'downloaded')
    this.checkWasDownloaded()
  }

  private checkWasDownloaded = () => {
    const filename = `mds-file/${MD5(this.filename).toString()}`
    this.wasDownloaded = localStorage.getItem(filename) === 'downloaded'
  }

  private getDefaultDescription = (): string =>
    this.getExtensionInfos().description

  private getFormatsVariant = (): {
    color: string;
    icon: string;
    iconBackground: string;
    variant: string;
  } => {
    return fileFormatsVariant[this.getExtensionInfos().format]
  }

  componentWillLoad (): void {
    this.checkWasDownloaded()
  }

  componentDidUpdate (): void {
    this.checkWasDownloaded()
  }

  render () {
    return (
      <Host tabindex="0" onClick={this.handleOnClick}>
        <div class={`preview ${this.getFormatsVariant().color} ${this.getFormatsVariant().iconBackground}`}>
          { this.preview !== undefined
            ? <div class="image-preview" style={{ backgroundImage: `url(${this.preview})` }}></div>
            : <mds-icon name={this.getFormatsVariant().icon}/>
          }
        </div>
        <div class="info">
          <div class="filename" title={ this.filename }>
            <mds-text truncate="word" typography="h6" class="name">{ this.getName() }</mds-text>
            { this.suffix === undefined && this.getSuffix() && <mds-text typography="h6" class="extension">.{ this.getSuffix() }</mds-text> }
          </div>
          <div class="detail">
            { this.getSuffix() && <mds-badge variant={this.getFormatsVariant().variant as ThemeFullVariantType} tone="quiet" class="suffix">{ this.getSuffix() }</mds-badge> }
            <mds-text truncate="word" typography="caption" class="description" title={ this.description ?? this.getDefaultDescription() }>{ this.description ?? this.getDefaultDescription() }</mds-text>
          </div>
        </div>
        { this.wasDownloaded &&
          <div class="indicator">
            <i class="svg downloaded" innerHTML={miBaselineFileDownloadDone} title={this.downloadedLabel}/>
          </div>
        }
      </Host>
    )
  }
}
