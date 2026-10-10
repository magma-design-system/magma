import Mime from 'mime';
import clsx from 'clsx';
import iconSortByStatus from '@icon/mi/baseline/category.svg';
import iconSortById from '@icon/mi/outline/schedule.svg';
import miOutlineFileUpload from '@icon/mi/outline/file-upload.svg';
import {
  AttachInternals,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  h,
  Watch,
  forceUpdate,
} from '@stencil/core';
import { setFormValue, setValidity } from '@common/form';
import {
  AttachmentSort,
  ErrorType,
  FileError,
  FileStatus,
  LOCALSTORAGE_KEY_USER_SORT,
  Status,
} from './meta/types';
import { genericMimeToExt } from '@dictionary/file-extensions';
import { MdsTabEventDetail } from '@component/mds-tab/meta/event-detail';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

const isSort = (value: unknown): value is AttachmentSort => value === 'date' || value === 'status';

@Component({
  tag: 'mds-input-upload',
  styleUrl: 'mds-input-upload.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputUpload {
  private nativeInput?: HTMLInputElement;
  private extensions: string;
  private fileUploaded = 0;
  private cssMinCols: number = 1000;
  private idFile: number = 0;
  // one object URL per previewed file, created once and revoked when the file leaves the list
  private readonly previewUrls = new Map<File, string>();
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @Element() private host: HTMLMdsInputUploadElement;
  @AttachInternals() internals: ElementInternals;
  @State() dragging: boolean = false;
  @State() files: FileStatus[] = [];
  @State() progress = 0;
  @State() animateText: boolean = false;
  // the order applied to the files: sort at load, then the user's choice from the sort tabs
  @State() activeSort: AttachmentSort = 'date';

  /**
   * Defines the file types the file input should accept
   */
  @Prop({ reflect: true }) readonly accept: string = '';

  /**
   * The name the accepted files are submitted under with the form, one entry per file
   */
  @Prop({ reflect: true }) readonly name?: string;

  /**
   * Specifies the max size of a single file that can be uploaded in MB
   */
  @Prop({ reflect: true }) readonly maxFileSize: number = 20;

  /**
   * Specifies the max number of files that can be uploaded
   */
  @Prop({ reflect: true }) readonly maxFiles: number = 1;

  /**
   * Specifies the order the files start sorted by, status or date of upload, and shows the sort tabs that let the user change it; if not defined the tabs are hidden and the order is the user's last choice
   */
  @Prop({ reflect: true }) readonly sort?: AttachmentSort;

  /**
   * Specifies initial files uploaded
   */
  @Prop() readonly initialValue?: FileList | File[];

  /**
   * Emits when the component files are changed
   */
  @Event({ eventName: 'mdsInputUploadChange' }) changedEvent: EventEmitter<FileList | null>;

  formResetCallback(): void {
    this.onReset();
  }

  connectedCallback(): void {
    // disconnectedCallback revoked the preview URLs: a moved component renders new ones
    if (this.files.length > 0) forceUpdate(this);
  }

  componentWillLoad(): void {
    this.extensions = this.getExtension();
    const userSort = localStorage.getItem(LOCALSTORAGE_KEY_USER_SORT);
    this.activeSort = isSort(this.sort) ? this.sort : isSort(userSort) ? userSort : 'date';
    this.updateInitialValue(this.initialValue);
  }

  componentDidLoad(): void {
    this.updateCSSCustomProps();
  }

  componentDidRender(): void {
    this.revokePreviewUrls(new Set(this.files.map((f) => f.file)));
  }

  disconnectedCallback(): void {
    this.revokePreviewUrls(new Set());
  }

  @Watch('initialValue')
  updateInitialValue(newValue: FileList | File[] | undefined) {
    if (newValue) {
      this.onAdd(newValue);
    }
  }

  @Watch('name')
  handleNameChange(): void {
    this.updateFormValue();
  }

  @Watch('sort')
  handleSortChange(newValue?: AttachmentSort): void {
    if (isSort(newValue)) {
      this.activeSort = newValue;
      this.sortFiles(this.files, newValue);
    }
  }

  /**
   * Returns a promise of the accepted files as a FileList, empty if there's none
   */
  @Method()
  getFiles(): Promise<FileList | null> {
    return Promise.resolve(this.acceptedFiles());
  }

  /**
   * Returns a promise of files error or null if there's none
   */
  @Method()
  getFilesError(): Promise<FileError[] | null> {
    const err = this.files
      .filter((file) => file.status === Status.ERROR)
      .map((file) => ({ filename: file.key, errorMessage: this.t.get(file.errorKey!) }));
    return err.length > 0 ? Promise.resolve(err) : Promise.resolve(null);
  }

  @Watch('maxFiles')
  handleMaxFilesChange(newValue: number, oldValue: number): void {
    if (newValue !== oldValue) {
      this.animateText = false;
    }
  }

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return;
    const elementStyles = window.getComputedStyle(this.host);
    this.cssMinCols = Number(elementStyles.getPropertyValue('--mds-input-upload-min-cols'));
  };

  private readonly onDropHandler = (event: DragEvent) => {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer) {
      this.onAdd(event.dataTransfer.files);
    }
  };

  private readonly onDragOverHandler = (event: DragEvent) => {
    event.preventDefault();
  };

  private readonly onDragEnterHandler = (event: DragEvent) => {
    this.dragging = true;
    this.animateText = true;
    event.preventDefault();
  };

  private readonly onDragLeaveHandler = (event: DragEvent) => {
    this.dragging = false;
    event.preventDefault();
  };

  private readonly onAdd = (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    this.prepareFiles(fileList);
    this.update();
  };

  private readonly onInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.onAdd(input.files);
    // the input only picks the files, the list lives in this.files: clearing it lets the user
    // pick a removed file again
    input.value = '';
  };

  /**
   * Delete single file from upload
   * @param filekey
   */
  private readonly onCancel = (filekey: string): void => {
    this.files = this.files.filter((f) => f.key !== filekey);
    this.update();
  };

  /**
   * Delete all files from upload
   */
  private readonly onReset = (): void => {
    this.files = [];
    this.update(true);
  };

  /**
   * Reset component's files
   */
  @Method()
  reset(): Promise<void> {
    this.onReset();
    return Promise.resolve();
  }

  private readonly onChangeTab = (event: MdsTabEventDetail): void => {
    // the tab reports the selection the component makes itself too (a new sort): only a
    // different order is the user's choice
    if (!isSort(event.value) || event.value === this.activeSort) return;
    this.activeSort = event.value;
    this.sortFiles(this.files, this.activeSort);
    localStorage.setItem(LOCALSTORAGE_KEY_USER_SORT, this.activeSort);
  };

  /**
   * Prepare file to be submitted.
   * Limit number of file to maxFiles
   * Check size and type for every single file.
   * @param fileList list recieved from input selection or drag and drop
   */
  private prepareFiles(fileList: FileList | File[]): void {
    const files = fileList instanceof FileList ? Array.from(fileList) : fileList;
    // prepare new file added
    for (const file of files) {
      // update only file not added previously or files with errors
      this.idFile += 1;
      const index = this.files.findIndex((f) => f.key === file.name);
      if (index === -1 || this.files[index].status !== Status.SUCCESS) {
        // remove file with error
        if (index !== -1) {
          this.files.splice(index, 1);
        }
        const { errorKey, type } = this.checkError(file);
        if (errorKey === undefined) {
          this.files.push({ key: file.name, file, id: this.idFile, status: Status.SUCCESS });
          this.fileUploaded += 1;
        } else {
          this.files.push({
            key: file.name,
            file,
            id: this.idFile,
            status: Status.ERROR,
            errorType: type,
            errorKey,
          });
        }
      }
    }
    this.sortFiles(this.files, this.activeSort);
  }

  // Stores the locale key, not the translated message: consumers translate at
  // read time so the texts follow the current language
  private checkError(file: File): { errorKey?: string; type?: ErrorType } {
    let errorKey: string | undefined;
    let type: ErrorType | undefined;
    if (this.fileUploaded >= this.maxFiles) {
      errorKey = 'maxFilesExceed';
      type = ErrorType.MAX;
    }
    if (!this.checkFileSize(file)) {
      errorKey = 'fileTooLarge';
      type = ErrorType.SIZE;
    }
    if (!this.checkFileType(file)) {
      errorKey = 'formatNotAlowed';
      type = ErrorType.TYPE;
    }
    return { errorKey, type };
  }

  // the files the form submits and getFiles() returns: the ones that passed the checks, in the
  // order they were added whatever order the list shows
  private acceptedFiles(): FileList {
    const data = new DataTransfer();
    this.files
      .filter((f) => f.status === Status.SUCCESS)
      .sort((a, b) => a.id - b.id)
      .forEach((f) => data.items.add(f.file));
    return data.files;
  }

  // one entry per file under the name, as a native file input submits them; a file input
  // without a name submits nothing
  private updateFormValue(): void {
    const files = this.acceptedFiles();
    const name = this.name ?? '';
    if (name === '' || files.length === 0) {
      setFormValue(this.internals, null);
      return;
    }
    const data = new FormData();
    Array.from(files).forEach((file) => data.append(name, file));
    setFormValue(this.internals, data);
  }

  private update(reset = false): void {
    const validity: ValidityStateFlags = {};
    const errorMessage: Set<string> = new Set();
    this.files
      .filter((f) => f.status === Status.ERROR)
      .forEach((error) => {
        switch (error.errorType) {
          case ErrorType.MAX:
            validity.rangeOverflow = true;
            break;
          case ErrorType.SIZE:
            validity.tooLong = true;
            break;
          case ErrorType.TYPE:
            validity.typeMismatch = true;
            break;
        }
        errorMessage.add(this.t.get(error.errorKey!));
      });
    this.updateFormValue();
    setValidity(this.internals, validity, Array.from(errorMessage).join(', '));
    this.updateProgress();
    this.changedEvent.emit(reset ? null : this.acceptedFiles());
  }

  /**
   * Update progress bar
   */
  private updateProgress() {
    const nFile = this.files
      .map((fileStatus) => (fileStatus.status === Status.SUCCESS ? 1 : 0) as number)
      .reduce((prev, curr) => prev + curr, 0);
    this.fileUploaded = nFile;
    this.progress = nFile / this.maxFiles;
  }

  /**
   * Sort recieved file and assign the result to this.files for update render
   *
   * @param files current list of files to be sorted
   * @param sort type of sorting
   */
  private sortFiles(files: FileStatus[], sort: AttachmentSort): void {
    if (sort === 'date') {
      this.files = files.slice().sort(this.sortById);
    }
    if (sort === 'status') {
      this.files = files.slice().sort(this.sortByStatusAndName);
    }
  }

  private checkFileSize(file: File): boolean {
    return file.size < this.maxFileSize * 1024 * 1024;
  }

  private checkFileType(file: File): boolean {
    const acceptArray = this.accept.replace(/ /g, '').split(',');
    // controllo mime type univoco (es. image/png)
    if (acceptArray.includes(file.type)) return true;
    // controllo mime type multiestensione (es. image/*)
    if (
      acceptArray.filter((value) => new RegExp(value.replace('*', '.*')).test(file.type)).length > 0
    )
      return true;
    // controllo estensione
    if (acceptArray.includes(`.${file.name.split('.').pop()}`)) return true;
    return false;
  }

  private getExtension(): string {
    return (
      this.accept
        .replace(/ /g, '')
        .split(',')
        .flatMap((mtype) => {
          // replace generic mime-type with related extensions
          if (mtype.includes('*')) {
            return [...(genericMimeToExt.get(mtype.split('/')[0]) ?? '')];
          }
          return mtype;
        })
        // format string
        .map((mtype) => (mtype.includes('.') ? mtype.slice(1) : Mime.getExtension(mtype)))
        .join(', ')
        .toUpperCase()
    );
  }

  private sortByStatusAndName(a: FileStatus, b: FileStatus): number {
    if (a.status === b.status) {
      return a.file.name.localeCompare(b.file.name);
    }
    return a.status === Status.SUCCESS ? -1 : 1;
  }

  private sortById(a: FileStatus, b: FileStatus): number {
    return b.id - a.id;
  }

  private previewUrl(file: File): string {
    let url = this.previewUrls.get(file);
    if (url === undefined) {
      url = URL.createObjectURL(file);
      this.previewUrls.set(file, url);
    }
    return url;
  }

  private revokePreviewUrls(keep: Set<File>): void {
    this.previewUrls.forEach((url, file) => {
      if (!keep.has(file)) {
        URL.revokeObjectURL(url);
        this.previewUrls.delete(file);
      }
    });
  }

  private isSortTabShown(): boolean {
    // the type has no empty sort, but the attribute can be empty or removed
    const sort: string = this.sort ?? '';
    return sort !== '' && this.files.length > 1;
  }

  private readonly handleAddFileClick = (): void => {
    this.nativeInput?.click();
  };

  private readonly handleTabChange = (event: CustomEvent<MdsTabEventDetail>): void => {
    this.onChangeTab(event.detail);
  };

  private readonly handleFileDelete = (filekey: string) => (): void => {
    this.onCancel(filekey);
  };

  render() {
    return (
      <Host>
        <div
          class={clsx('drag-area', this.dragging && 'drag-area--on-drag-enter')}
          onDrop={this.onDropHandler}
          onDragOver={this.onDragOverHandler}
          onDragEnter={this.onDragEnterHandler}
          onDragLeave={this.onDragLeaveHandler}
        >
          <div class="main-action">
            <div class="main-action-icon">
              <mds-icon class="icon" name={miOutlineFileUpload}></mds-icon>
            </div>
            <mds-text
              animation={this.animateText ? 'yugop' : 'none'}
              variant="title"
              typography="action"
              text={
                this.dragging
                  ? this.t.get('dragEnter')
                  : this.t.get('clickOrDrag', { maxFiles: this.maxFiles })
              }
            ></mds-text>
          </div>
          <div class="main-actions">
            <mds-button
              variant="primary"
              onClick={this.handleAddFileClick}
              label={
                this.files != null
                  ? this.t.get('addFile', { maxFiles: this.maxFiles })
                  : this.t.get('selectFile')
              }
            ></mds-button>
            {this.files.length > 0 && (
              <mds-button
                variant="error"
                onClick={this.onReset}
                label={this.t.get('cancel')}
              ></mds-button>
            )}
          </div>
          <div class="main-infos">
            <mds-progress
              aria-hidden="true"
              class="progress-bar"
              progress={this.progress}
            ></mds-progress>
            {this.files.length < 1 ? (
              <mds-text variant="info" typography="caption">
                {this.t.get('maxFilesUpload', { maxFiles: this.maxFiles })}
              </mds-text>
            ) : (
              <mds-text variant="info" typography="caption">
                {(this.maxFiles ?? 0) !== 0 && !Number.isNaN(this.maxFiles)
                  ? this.t.get('currentFilesWithMax', {
                      currentFiles: this.files.length,
                      maxFiles: this.maxFiles,
                    })
                  : this.t.get('currentFilesNoMax', { currentFiles: this.files.length })}
              </mds-text>
            )}
          </div>
        </div>
        <input
          type="file"
          accept={this.accept}
          hidden
          ref={(i) => (this.nativeInput = i)}
          onChange={this.onInputChange}
          multiple={this.maxFiles > 1}
        />
        <div class="additional-infos">
          <div class={clsx('file-specs', this.isSortTabShown() && 'file-specs-sort')}>
            <mds-text variant="info" typography="caption">
              {this.extensions !== ''
                ? `${this.t.get('canUpload')} ${this.extensions}`
                : this.t.get('canUploadAll')}
            </mds-text>
            <mds-text variant="info" typography="caption">
              {this.t.get('maxFileSizePerFile', { maxFileSize: this.maxFileSize })}
            </mds-text>
          </div>
          {this.isSortTabShown() && (
            <mds-tab class="action-sort" onMdsTabChange={this.handleTabChange}>
              <mds-tab-item
                icon={iconSortById}
                selected={this.activeSort === 'date'}
                title={this.t.get('sortByDate')}
                value="date"
              ></mds-tab-item>
              <mds-tab-item
                icon={iconSortByStatus}
                selected={this.activeSort === 'status'}
                title={this.t.get('sortByStatus')}
                value="status"
              ></mds-tab-item>
            </mds-tab>
          )}
        </div>
        <div
          class={clsx('file-list', this.files.length > this.cssMinCols && 'file-list--more-items')}
        >
          {this.files.map((file) => {
            switch (file.status) {
              case Status.ERROR:
                return (
                  <mds-file-preview
                    deletable
                    variant="error"
                    filename={file.file.name}
                    filesize={file.file.size.toString()}
                    onMdsFileDelete={this.handleFileDelete(file.key)}
                    message={this.t.get(file.errorKey!)}
                  ></mds-file-preview>
                );
              case Status.SUCCESS:
                return (
                  <mds-file-preview
                    deletable
                    filename={file.file.name}
                    filesize={file.file.size.toString()}
                    onMdsFileDelete={this.handleFileDelete(file.key)}
                    src={this.previewUrl(file.file)}
                  ></mds-file-preview>
                );
            }
          })}
        </div>
      </Host>
    );
  }
}
