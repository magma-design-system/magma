import { Component, Host, h, Prop } from '@stencil/core'
import { ExtensionSuffixTypes } from '../../types/extension-suffix'
// import { fileFormatsDictionary } from '../../dictionary/fileformats'
// import { fileExtensionsDictionary } from '../../dictionary/file-extensions'

@Component({
  tag: 'mds-download',
  styleUrl: 'mds-download.css',
  shadow: true,
})
export class MdsDownload {

  /**
   * Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen
   */
  @Prop() readonly suffix?: ExtensionSuffixTypes

  /**
   * Overrides the default filetype description
   */
  @Prop() readonly description?: string

  /**
   * The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary
   */
  @Prop() readonly filename: string

  /**
   * The image preview if available of a file, useful if you have a logo to display, or a smaller version of a bigger image
   */
  @Prop() readonly preview?: string

  /**
   * Choose if display a transparency grid for the preview image, useful if your image has transparent areas and you want to display them
   */
  @Prop() readonly transparencyGrid?: boolean = false

  render() {
    return (
      <Host class="bg-adjust-tone flex overflow-hidden rounded-md shadow-sharp items-stretch w-full">
        <div class="flex items-center justify-center w-12 bg-adjust-tone-19 flex-shrink-0">
          <mds-icon name="status-warning"/>
        </div>
        <div class="flex flex-col py-2 px-3 flex-grow min-w-0">
          <div class="flex min-w-0">
            <mds-text typography="action" class="min-w-0 truncate">This is the filename</mds-text>
            <mds-text typography="action" class="flex-shrink-0">.ext</mds-text>
          </div>
          <div class="flex min-w-0">
            <mds-file-extension suffix="mpeg"></mds-file-extension>
          </div>
        </div>
      </Host>
    )
  }

}
