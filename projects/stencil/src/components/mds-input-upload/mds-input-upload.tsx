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

@Component({
  tag: 'mds-input-upload',
  styleUrl: 'mds-input-upload.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputUpload {
  private nativeInput?: HTMLInputElement;
  private elDragArea?: HTMLElement;
  private extensions: string;
  private fileUploaded = 0;
  private cssMinCols: number = 1000;
  private idFile: number = 0;
  private userSort: AttachmentSort;
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

  /**
   * Defines the file types the file input should accept
   */
  @Prop({ reflect: true }) readonly accept: string = '';

  /**
   * Specifies the max size of a single file that can be uploaded in MB
   */
  @Prop({ reflect: true }) readonly maxFileSize: number = 20;

  /**
   * Specifies the max number of files that can be uploaded
   */
  @Prop({ reflect: true }) readonly maxFiles: number = 1;

  /**
   * Specifies if the component should show a sort widget by status or date of upload, if not defined let user choose
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

  componentWillLoad(): void {
    this.extensions = this.getExtension();
    this.userSort = (localStorage.getItem(LOCALSTORAGE_KEY_USER_SORT) as AttachmentSort) ?? 'date';
    this.updateInitialValue(this.initialValue);
  }

  componentDidLoad(): void {
    this.updateCSSCustomProps();
  }

  @Watch('initialValue')
  updateInitialValue(newValue: FileList | File[] | undefined) {
    if (newValue) {
      this.onAdd(newValue);
    }
  }

  /**
   * Returns a promise of files uploaded as Filelist or null if there's none
   */
  @Method()
  getFiles(): Promise<FileList | null> {
    return Promise.resolve(this.nativeInput?.files ?? null);
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
    if (this.nativeInput && event.dataTransfer) {
      this.update(this.nativeInput, this.prepareFiles(event.dataTransfer.files));
    }
    event.preventDefault();
  };

  private readonly onDragOverHandler = (event: DragEvent) => {
    event.preventDefault();
  };

  private readonly onDragEnterHandler = (event: DragEvent) => {
    this.dragging = true;
    this.animateText = true;
    this.elDragArea?.classList.add('drag-area--on-drag-enter');
    event.preventDefault();
  };

  private readonly onDragLeaveHandler = (event: DragEvent) => {
    this.dragging = false;
    this.elDragArea?.classList.remove('drag-area--on-drag-enter');
    event.preventDefault();
  };

  private readonly onAdd = (event: Event | FileList | File[]) => {
    if (!event) return;
    if (event instanceof FileList || Array.isArray(event)) {
      this.update(this.nativeInput, this.prepareFiles(event));
    } else {
      const input = event.target as HTMLInputElement;
      this.update(input, this.prepareFiles(input.files));
    }
  };

  /**
   * Delete single file from upload
   * @param filekey
   */
  private readonly onCancel = (filekey: string): void => {
    this.files = this.files.filter((f) => f.key !== filekey);
    if (this.nativeInput) {
      const data = new DataTransfer();
      this.files.forEach((f) => {
        if (f.status === Status.SUCCESS) {
          data.items.add(f.file);
        }
      });
      this.update(this.nativeInput, data.files);
    }
  };

  /**
   * Delete all files from upload
   */
  private readonly onReset = (): void => {
    if (this.nativeInput) {
      this.files = [];
      this.nativeInput.value = '';
      this.update(this.nativeInput, null);
    }
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
    if (event.value !== undefined && event.value !== '') {
      this.sortFiles(this.files, event.value as AttachmentSort);
      this.userSort = event.value as AttachmentSort;
      localStorage.setItem(LOCALSTORAGE_KEY_USER_SORT, this.userSort);
    }
  };
  /**
   * Prepare file to be submitted.
   * Limit number of file to maxFiles
   * Check size and type for every single file.
   * @param fileList list recieved from input selection or drag and drop
   * @returns list of files accepted
   */
  private prepareFiles(fileList: FileList | File[] | null): FileList | null {
    if (!fileList) return null;
    const files = fileList instanceof FileList ? Array.from(fileList) : fileList;
    const data = new DataTransfer();
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
    // set input.files only uploadable file
    this.files.filter((f) => f.status === Status.SUCCESS).forEach((f) => data.items.add(f.file));
    this.sortFiles(this.files, this.sort ?? this.userSort);
    // this.updateProgress()
    return data.files;
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

  private update(input: HTMLInputElement | undefined, files: FileList | null): void {
    if (!input) return;
    input.files = files;

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
    setFormValue(this.internals, input.value);
    setValidity(this.internals, validity, Array.from(errorMessage).join(', '));
    this.updateProgress();
    this.changedEvent.emit(files);
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

  private isSortTabShown(): boolean {
    return this.sort !== undefined && this.files.length > 1;
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
          class="drag-area"
          onDrop={this.onDropHandler}
          onDragOver={this.onDragOverHandler}
          onDragEnter={this.onDragEnterHandler}
          onDragLeave={this.onDragLeaveHandler}
          ref={(dragArea) => (this.elDragArea = dragArea)}
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
                {this.maxFiles !== 0 && !Number.isNaN(this.maxFiles)
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
          onChange={this.onAdd}
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
                selected={this.userSort === 'date'}
                title={this.t.get('sortByDate')}
                value="date"
              ></mds-tab-item>
              <mds-tab-item
                icon={iconSortByStatus}
                selected={this.userSort === 'status'}
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
                    src={URL.createObjectURL(file.file)}
                  ></mds-file-preview>
                );
            }
          })}
        </div>
      </Host>
    );
  }
}
