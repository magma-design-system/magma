import {
  Build,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import { ExtensionSuffixType } from '@type/file-types';
import { MdsFileEventDetail } from './meta/event-detail';
import { ThemeFullVariantType } from '@type/variant';
import { getFormatsVariant, getName, getSuffix, getExtensionInfos } from '@common/file';
import { fnv1a } from '@common/hash';
import { setAttributeIfEmpty } from '@common/aria';
import { KeyboardManager } from '@common/keyboard-manager';
import miBaselineFileDownloadDone from '@icon/mi/baseline/file-download-done.svg';
import miOutlineFileDownload from '@icon/mi/outline/file-download.svg';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import fileDescriptionLocaleEl from '@meta/file-format/locale.el.json';
import fileDescriptionLocaleEn from '@meta/file-format/locale.en.json';
import fileDescriptionLocaleEs from '@meta/file-format/locale.es.json';
import fileDescriptionLocaleIt from '@meta/file-format/locale.it.json';

// https://stackoverflow.com/questions/1106377/detect-when-a-browser-receives-a-file-download

@Component({
  tag: 'mds-file',
  styleUrl: 'mds-file.css',
  shadow: true,
})
export class MdsFile {
  @Element() private host: HTMLMdsFileElement;
  private t: Locale = new Locale({
    el: { ...localeEl, ...fileDescriptionLocaleEl },
    en: { ...localeEn, ...fileDescriptionLocaleEn },
    es: { ...localeEs, ...fileDescriptionLocaleEs },
    it: { ...localeIt, ...fileDescriptionLocaleIt },
  });

  @State() private wasDownloaded = false;
  private km = new KeyboardManager();

  /**
   * Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen
   */
  @Prop({ reflect: true }) readonly suffix?: ExtensionSuffixType;

  /**
   * Overrides the default filetype description
   */
  @Prop() readonly description?: string;

  /**
   * The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary
   */
  @Prop() readonly filename: string;

  /**
   * The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image
   */
  @Prop() readonly preview?: string;

  /**
   * Hides the download icon
   */
  @Prop() readonly hideDownloadedIcon?: boolean = false;

  /**
   * Sets if the download icon must be shown or not
   */
  @Prop({ reflect: true, mutable: true }) format?: string;

  /**
   * Emits when the component is clicked, returning file infos
   */
  @Event({ eventName: 'mdsFileDownload' }) downloadedEvent: EventEmitter<MdsFileEventDetail>;

  private handleOnClick = (): void => {
    const { format, description } = getExtensionInfos(this.filename, this.suffix);
    this.downloadedEvent.emit({
      description: this.description ?? description,
      extension: getSuffix(this.filename, this.suffix),
      filename: this.filename,
      target: this.host,
      type: format,
    });
    localStorage.setItem(this.downloadedStorageKey(), 'downloaded');
    this.checkWasDownloaded();
  };

  /**
   * The localStorage key that records the download of the filename: `mdsFile/` plus a short hash
   * of the name, so the key stays short and uniform whatever the name holds. A plain hash, not a
   * digest: the key is no security measure.
   */
  private downloadedStorageKey = (): string => `mdsFile/${fnv1a(this.filename)}`;

  private checkWasDownloaded = (): void => {
    // the hydrate app has a window but no storage of a user: the indicator is a client matter
    if (!Build.isBrowser) return;
    this.wasDownloaded = localStorage.getItem(this.downloadedStorageKey()) === 'downloaded';
  };

  private getDefaultDescription = (): string =>
    getExtensionInfos(this.filename, this.suffix).description;

  componentWillLoad(): void {
    this.format = getExtensionInfos(this.filename, this.suffix).format;
    this.checkWasDownloaded();
  }

  // the file is a button that asks for the download: a tab stop that Enter and Space activate as
  // a click does. A role set by the caller (a file inside a list of options) is theirs and stays
  componentDidLoad(): void {
    setAttributeIfEmpty(this.host, 'role', 'button');
    this.km.addElement(this.host);
    this.km.attachClickBehavior('element', { space: true });
  }

  // a file moved in the page is disconnected and connected again, without loading again
  connectedCallback(): void {
    this.km.attachClickBehavior('element', { space: true });
  }

  disconnectedCallback(): void {
    this.km.detachClickBehavior();
  }

  @Watch('filename')
  handleFilename(newValue: string): void {
    this.format = getExtensionInfos(newValue, this.suffix).format;
    this.checkWasDownloaded();
  }

  render() {
    return (
      <Host
        tabindex="0"
        onClick={this.handleOnClick}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class="preview">
          {this.preview !== undefined ? (
            <div class="image-preview" style={{ backgroundImage: `url(${this.preview})` }}></div>
          ) : (
            <mds-icon
              class="icon-preview"
              name={getFormatsVariant(this.filename, this.suffix).icon}
            />
          )}
          <div class="download-icon">
            <mds-icon name={miOutlineFileDownload}></mds-icon>
          </div>
        </div>
        <div class="info">
          <div class="filename" title={this.filename}>
            <mds-text truncate="word" typography="h6" class="name">
              {getName(this.filename)}
            </mds-text>
            {this.suffix === undefined && getSuffix(this.filename, this.suffix) && (
              <mds-text typography="h6" class="extension">
                .{getSuffix(this.filename, this.suffix)}
              </mds-text>
            )}
          </div>
          <div class="detail">
            {getSuffix(this.filename, this.suffix) && (
              <mds-badge
                variant={
                  getFormatsVariant(this.filename, this.suffix).variant as ThemeFullVariantType
                }
                tone="weak"
                class="suffix"
              >
                {getSuffix(this.filename, this.suffix)}
              </mds-badge>
            )}
            <mds-text
              truncate="word"
              typography="caption"
              class="description"
              title={this.description ?? this.t.get(this.getDefaultDescription())}
            >
              {this.description ?? this.t.get(this.getDefaultDescription())}
            </mds-text>
          </div>
        </div>
        {this.wasDownloaded && !this.hideDownloadedIcon && (
          <div class="indicator">
            <i
              class="downloaded"
              innerHTML={miBaselineFileDownloadDone}
              title={this.t.get('alreadyDownloaded')}
            />
          </div>
        )}
      </Host>
    );
  }
}
