import { Component, Element, Event, EventEmitter, Host, h, Prop, State, Watch, Method } from '@stencil/core'
import { ExtensionSuffixType } from '@type/file-types'
import { MdsFileEventDetail } from './meta/event-detail'
import { ThemeFullVariantType } from '@type/variant'
import { MD5 } from 'crypto-js'
import { getFormatsVariant, getName, getSuffix, getExtensionInfos } from '@common/file'
import miBaselineFileDownloadDone from '@icon/mi/baseline/file-download-done.svg'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import fileDescriptionLocaleEl from '@meta/file-format/locale.el.json'
import fileDescriptionLocaleEn from '@meta/file-format/locale.en.json'
import fileDescriptionLocaleEs from '@meta/file-format/locale.es.json'
import fileDescriptionLocaleIt from '@meta/file-format/locale.it.json'

// https://stackoverflow.com/questions/1106377/detect-when-a-browser-receives-a-file-download

@Component({
  tag: 'mds-file',
  styleUrl: 'mds-file.css',
  shadow: true,
})
export class MdsFile {

  @Element() private host: HTMLMdsFileElement
  private t:Locale = new Locale({
    el: { ...localeEl, ...fileDescriptionLocaleEl },
    en: { ...localeEn, ...fileDescriptionLocaleEn },
    es: { ...localeEs, ...fileDescriptionLocaleEs },
    it: { ...localeIt, ...fileDescriptionLocaleIt },
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  @State() private wasDownloaded = false

  /**
   * Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen
   */
  @Prop({ reflect: true }) readonly suffix?: ExtensionSuffixType

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

  /**
   * Sets if the download icon must be shown or not
   */
  @Prop() readonly showDownloadedIcon?: boolean = true

  /**
   * Sets if the download icon must be shown or not
   */
  @Prop({ reflect: true, mutable: true }) format?: string

  /**
   * Emits when the component is clicked, returning file infos
   */
  @Event({ eventName: 'mdsFileDownload' }) downloadedEvent: EventEmitter<MdsFileEventDetail>

  private handleOnClick = (): void => {
    const { format, description } = getExtensionInfos(this.filename, this.suffix)
    this.downloadedEvent.emit({ description: this.description ?? description, extension: getSuffix(this.filename, this.suffix), filename: this.filename, target: this.host, type: format })
    localStorage.setItem(`mdsFile${MD5(this.filename).toString()}`, 'downloaded')
    this.checkWasDownloaded()
  }

  private checkWasDownloaded = () => {
    const filename = `mdsFile/${MD5(this.filename).toString()}`
    this.wasDownloaded = localStorage.getItem(filename) === 'downloaded'
  }

  private getDefaultDescription = (): string =>
    getExtensionInfos(this.filename, this.suffix).description

  componentWillLoad (): void {
    this.checkWasDownloaded()
    this.t.lang(this.host)
    this.format = getExtensionInfos(this.filename, this.suffix).format
  }

  componentDidUpdate (): void {
    this.checkWasDownloaded()
  }

  @Watch('filename')
  handleFilename (newValue: string): void {
    this.format = getExtensionInfos(newValue, this.suffix).format
  }

  render () {
    return (
      <Host tabindex="0" onClick={this.handleOnClick}>
        <div class="preview">
          { this.preview !== undefined
            ? <div class="image-preview" style={{ backgroundImage: `url(${this.preview})` }}></div>
            : <mds-icon name={getFormatsVariant(this.filename, this.suffix).icon}/>
          }
        </div>
        <div class="info">
          <div class="filename" title={ this.filename }>
            <mds-text truncate="word" typography="h6" class="name">{ getName(this.filename) }</mds-text>
            { this.suffix === undefined && getSuffix(this.filename, this.suffix) && <mds-text typography="h6" class="extension">.{ getSuffix(this.filename, this.suffix) }</mds-text> }
          </div>
          <div class="detail">
            { getSuffix(this.filename, this.suffix) && <mds-badge variant={getFormatsVariant(this.filename, this.suffix).variant as ThemeFullVariantType} tone="weak" class="suffix">{ getSuffix(this.filename, this.suffix) }</mds-badge> }
            <mds-text truncate="word" typography="caption" class="description" title={ this.description ?? this.t.get(this.getDefaultDescription()) }>{ this.description ?? this.t.get(this.getDefaultDescription()) }</mds-text>
          </div>
        </div>
        { this.wasDownloaded && this.showDownloadedIcon &&
          <div class="indicator">
            <i class="downloaded" innerHTML={miBaselineFileDownloadDone} title={this.t.get('alreadyDownloaded')}/>
          </div>
        }
      </Host>
    )
  }
}
