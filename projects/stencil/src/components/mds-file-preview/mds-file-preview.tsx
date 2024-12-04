import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import { Component, Element, Event, EventEmitter, Host, h, Prop, Watch, State, Method } from '@stencil/core'
import { ExtensionSuffixType } from '@type/file-types'
import { MdsFilePreviewEventDetail } from './meta/event-detail'
import { TypographyTruncateType } from '@type/text'
import { clsx } from 'clsx'
import { filesize } from 'filesize'
import { ThemeFullVariantAvatarType, ThemeFullVariantType } from '@type/variant'
import { getFormatsVariant, getSuffix, getExtensionInfos } from '@common/file'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import fileDescriptionLocaleEl from '@meta/file-format/locale.el.json'
import fileDescriptionLocaleEn from '@meta/file-format/locale.en.json'
import fileDescriptionLocaleEs from '@meta/file-format/locale.es.json'
import fileDescriptionLocaleIt from '@meta/file-format/locale.it.json'

@Component({
  tag: 'mds-file-preview',
  styleUrl: 'mds-file-preview.css',
  shadow: true,
})
export class MdsFilePreview {

  @Element() host: HTMLMdsFilePreviewElement
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

  // ciaone

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop({ reflect: true }) readonly deletable?: boolean

  /**
   * Enables the download icon to perform the related action on element
   */
  @Prop({ reflect: true }) readonly downloadable?: boolean

  /**
   * Overrides the default filetype description
   */
  @Prop({ reflect: true }) readonly description?: string

  /**
   * The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary
   */
  @Prop({ reflect: true }) readonly filename!: string

  /**
   * The filesize shown, if you pass a string you can write whathever you want, if you pass a number it expect filesize in bytes, the component will format it automatically.
   */
  @Prop({ reflect: true }) readonly filesize?: string

  /**
   * Sets a feedback message related to the component
   */
  @Prop({ reflect: true }) readonly message?: string

  /**
   * Truncates the filename shown
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType = 'word'

  /**
   * The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image
   */
  @Prop({ reflect: true }) readonly src?: string

  /**
   * Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen
   */
  @Prop({ reflect: true }) readonly suffix?: ExtensionSuffixType

  /**
   * The name of the icon or a base64 string to render it as an svg
   */
  @Prop({ reflect: true }) icon: string

  /**
   * The variant of the component, is shown only if the message attribute is defined
   */
  @Prop({ reflect: true }) variant?: ThemeFullVariantAvatarType

  /**
   * Sets if the download icon must be shown or not
   */
  @Prop({ reflect: true, mutable: true }) format?: string

  /**
   * Emits when the component is clicked, returning file infos
   */
  @Event({ eventName: 'mdsFileDownload' }) downloadedEvent: EventEmitter<MdsFilePreviewEventDetail>

  /**
   * Emits when the component is removed, returning file infos
   */
  @Event({ eventName: 'mdsFileDelete' }) deletedEvent: EventEmitter<MdsFilePreviewEventDetail>

  private getDefaultKeyDescription = (): string =>
    getExtensionInfos(this.filename, this.suffix).description

  private onClickDeletedEvent = (): void => {
    this.deletedEvent.emit({ target: this.host, filename: this.filename, extension: getSuffix(this.filename, this.suffix) })
  }

  private onClickDownloadEvent = (): void => {
    this.downloadedEvent.emit({ target: this.host, filename: this.filename, extension: getSuffix(this.filename, this.suffix) })
  }

  componentWillLoad (): void {
    this.t.lang(this.host)
    this.format = getExtensionInfos(this.filename, this.suffix).format
  }

  componentDidLoad (): void {
    this.handleDownloadable(this.downloadable)
  }

  @Watch('filename')
  handleFilename (newValue: string): void {
    this.format = getExtensionInfos(newValue, this.suffix).format
  }

  @Watch('downloadable')
  handleDownloadable (newValue?: boolean, oldValue?: boolean): void {
    if (newValue === oldValue) return
    const card = this.host.shadowRoot?.querySelector('.card')
    if (newValue) {
      card?.addEventListener('click', this.onClickDownloadEvent)
      return
    }
    card?.removeEventListener('click', this.onClickDownloadEvent)
  }

  render () {
    return (
      <Host>
        { this.deletable && <mds-button title={this.t.get('remove')} class="action-delete" icon={miBaselineCancel} variant="light" onClick={this.onClickDeletedEvent}></mds-button> }
        <div class="card" part="card" onClick={this.onClickDownloadEvent}>
          { this.src && !this.message && getExtensionInfos(this.filename, this.suffix).preview
            ? <mds-img src={this.src} class="preview preview--image" aspect-ratio="1/1"></mds-img>
            : <div class={clsx('preview', !this.message ? 'preview--icon' : 'preview--status')}>
              { this.icon
                ? <mds-icon class="icon" name={this.icon}></mds-icon>
                : <mds-icon class="icon" name={getFormatsVariant(this.filename, this.suffix).icon}/>
              }
              { this.message && <mds-text class="message" typography="caption" variant="info">{ this.message }</mds-text> }
            </div>
          }
          <mds-text class="file-name" typography="h6" variant="title" truncate={this.truncate} title={ this.filename }>{ this.filename }</mds-text>
          <footer class={clsx('infos', this.filesize && 'infos--has-file-size')}>
            { this.filesize && this.filesize === Number(this.filesize).toString() && <mds-text class="file-size" truncate="word" typography="caption" variant="info">{ filesize(Number(this.filesize), { standard: 'jedec' }) }</mds-text> }
            { this.filesize && this.filesize !== Number(this.filesize).toString() && <mds-text class="file-size" truncate="word" typography="caption" variant="info">{ this.filesize }</mds-text> }
            { getSuffix(this.filename, this.suffix) && <mds-badge variant={getFormatsVariant(this.filename, this.suffix).variant as ThemeFullVariantType} tone="weak" class="suffix" title={ this.description ?? this.t.get(this.getDefaultKeyDescription()) }>{ getSuffix(this.filename, this.suffix) }</mds-badge> }
            { !this.filesize && <mds-text class="description" truncate="word" typography="caption" variant="info" title={ this.description ?? this.t.get(this.getDefaultKeyDescription()) }>{ this.description ?? this.t.get(this.getDefaultKeyDescription()) }</mds-text> }
          </footer>
        </div>
      </Host>
    )
  }
}
