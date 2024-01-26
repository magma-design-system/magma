import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import { Component, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { ExtensionSuffixType } from '@type/file-types'
import { MdsFilePreviewEventDetail } from './meta/event-detail'
import { TypographyTruncateType } from '@type/text'
import { clsx } from 'clsx'
import { filesize } from 'filesize'
import { ThemeFullVariantType } from '@type/variant'
import { getFormatsVariant, getSuffix, getExtensionInfos } from '@common/file'

@Component({
  tag: 'mds-file-preview',
  styleUrl: 'mds-file-preview.css',
  shadow: true,
})
export class MdsFilePreview {

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop({ reflect: true }) readonly deletable?: boolean

  /**
   * Overrides the default filetype description
   */
  @Prop({ reflect: true }) readonly description?: string

  /**
   * The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary
   */
  @Prop({ reflect: true }) readonly filename: string

  /**
   * The filesize shown, if you pass a string you can write whathever you want, if you pass a number it expect filesize in bytes, the component will format it automatically.
   */
  @Prop({ reflect: true }) readonly filesize?: string | number

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
  @Prop({ reflect: true }) readonly icon: string

  @Prop() readonly variant: string = 'pino'

  /**
   * Emits when the component is clicked, returning file infos
   */
  @Event({ eventName: 'mdsFileDownload' }) downloadedEvent: EventEmitter<MdsFilePreviewEventDetail>

  /**
   * Emits when the component is removed, returning file infos
   */
  @Event({ eventName: 'mdsFileRemove' }) removedEvent: EventEmitter<MdsFilePreviewEventDetail>

  private getDefaultDescription = (): string =>
    getExtensionInfos(this.filename, this.suffix).description

  render () {
    console.info(typeof(this.filesize))
    return (
      <Host>
        { this.deletable && <mds-button class="action-delete" icon={miBaselineCancel} variant="light" onClick={() => { console.info('onClick') }}></mds-button> }
        <div class="card" part="card">
          { this.src && !this.message && getFormatsVariant(this.filename, this.suffix).preview
            ? <mds-img src={this.src} class="preview preview--image" aspect-ratio="1/1"></mds-img>
            : <div class={`preview preview--icon ${getFormatsVariant(this.filename, this.suffix).color} ${getFormatsVariant(this.filename, this.suffix).iconBackground}`}>
              { this.icon
                ? <mds-icon class="icon" name={this.icon}></mds-icon>
                : <mds-icon class="icon" name={getFormatsVariant(this.filename, this.suffix).icon}/>
              }
              { this.message && <mds-text typography="caption" variant="info">{ this.message }</mds-text> }
            </div>
          }
          <mds-text class="file-name" typography="h6" variant="title" truncate={this.truncate} title={ this.filename }>{ this.filename }</mds-text>
          <footer class={clsx('infos', this.filesize && 'infos--has-file-size')}>
            { this.filesize && typeof(this.filesize) === 'number' && <mds-text class="file-size" typography="caption" variant="info">{ filesize(Number(this.filesize), { standard: 'jedec' }) }</mds-text> }
            { this.filesize && typeof(this.filesize) !== 'number' && <mds-text class="file-size" typography="caption" variant="info">{ this.filesize }</mds-text> }
            { getSuffix(this.filename, this.suffix) && <mds-badge variant={getFormatsVariant(this.filename, this.suffix).variant as ThemeFullVariantType} tone="quiet" class="suffix">{ getSuffix(this.filename, this.suffix) }</mds-badge> }
            { !this.filesize && <mds-text class="description" truncate="word" typography="caption" variant="info" title={ this.description ?? this.getDefaultDescription() }>{ this.description ?? this.getDefaultDescription() }</mds-text> }
          </footer>
        </div>
      </Host>
    )
  }
}
