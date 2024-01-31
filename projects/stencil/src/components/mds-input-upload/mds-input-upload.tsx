import Mime from 'mime'
import clsx from 'clsx'
import iconSortByStatus from '@icon/mi/baseline/category.svg'
import iconSortById from '@icon/mi/outline/schedule.svg'
import miBaselineAddCircle from '@icon/mi/baseline/add-circle.svg'
import { AttachInternals, Component, Element, Host, Method, Prop, State, h } from '@stencil/core'
import { AttachmentSort, FileStatus, LOCALSTORAGE_KEY_USER_SORT, Status } from './meta/types'
import { hashValue } from '@common/aria'
import { genericMimeToExt } from '@dictionary/file-extensions'
import { MdsTabEventDetail } from '@component/mds-tab/meta/event-detail'

@Component({
  tag: 'mds-input-upload',
  styleUrl: 'mds-input-upload.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputUpload {

  private mainActionTitle = {
    default: 'Clicca o trascina qui per selezionare i file da caricare',
    uploading: 'Caricamento in corso...',
    dragEnter: 'Rilascia qui per iniziare il caricamento',
    end: 'Caricamento completato',
  }

  @Element() private host: HTMLMdsInputUploadElement
  @AttachInternals() internals: ElementInternals
  @State() actionTitle: string = this.mainActionTitle.default
  @State() files: FileStatus[] = []
  @State() progress = 0

  private nativeInput?: HTMLInputElement
  private elDragArea?: HTMLElement
  private extensions: string
  private fileUploaded = 0
  private cssMinCols: number = 1000
  private id: number = 0
  private userSort: AttachmentSort

  /**
   * Defines the file types the file input should accept
   */
  @Prop({ reflect: true }) readonly accept!: string

  /**
   * Specifies the max size of a single file that can be uploaded in MB
   */
  @Prop({ reflect: true }) readonly maxFileSize = 20

  /**
   * Specifies the max number of files that can be uploaded
   */
  @Prop({ reflect: true }) readonly maxFiles = 1

  /**
   * Specifies if the component should show a sort widget by status or date of upload, if not defined let user choose
   */
  @Prop({ reflect: true }) readonly sort?: AttachmentSort

  componentWillLoad (): void {
    this.extensions = this.getExtension()
    this.userSort = AttachmentSort[localStorage.getItem(LOCALSTORAGE_KEY_USER_SORT) ?? AttachmentSort.date]
  }

  componentDidLoad (): void {
    this.updateCSSCustomProps()
  }

  /**
   * Returns a promise of files uploaded as Filelist or null if there's none
   */
  @Method()
  getFiles (): Promise<FileList | null> {
    return Promise.resolve(this.nativeInput?.files ?? null)
  }

  private updateCSSCustomProps = (): void => {
    const elementStyles = window.getComputedStyle(this.host)
    this.cssMinCols = Number(elementStyles.getPropertyValue('--mds-input-upload-min-cols'))
  }

  private onDropHandler = (event: DragEvent) => {
    if (this.nativeInput && event.dataTransfer) {
      this.nativeInput.files = this.prepareFiles(event.dataTransfer.files)
      this.internals.setFormValue(this.nativeInput.value)
    }
    event.preventDefault()
  }

  private onDragOverHandler = (event: DragEvent) => {
    event.preventDefault()
  }

  private onDragEnterHandler = (event: DragEvent) => {
    this.actionTitle = this.mainActionTitle.dragEnter
    this.elDragArea?.classList.add('drag-area--on-drag-enter')
    event.preventDefault()
  }

  private onDragLeaveHandler = (event: DragEvent) => {
    this.actionTitle = this.mainActionTitle.default
    this.elDragArea?.classList.remove('drag-area--on-drag-enter')
    event.preventDefault()
  }

  private onAdd = (event: Event) => {
    const input = ((event.target) as HTMLInputElement)
    input.files = this.prepareFiles(input.files)
    this.internals.setFormValue(input.value)
  }

  /**
   * Delete single file from upload
   * @param filekey
   */
  private onCancel = (filekey: string): void => {
    this.files = this.files.filter(f => f.key !== filekey)
    if (this.nativeInput) {
      const data = new DataTransfer()
      this.files.forEach(f => {if (f.status === Status.SUCCESS) {data.items.add(f.file)}})
      this.nativeInput.files = data.files
      this.fileUploaded -= 1
      this.updateProgress()
    }
  }

  /**
   * Delete all files from upload
   */
  private onReset = () : void => {
    if (this.nativeInput) {
      this.files = []
      this.nativeInput.files = null
      this.nativeInput.value = ''
      this.internals.setFormValue(null)
      this.fileUploaded = 0
      this.updateProgress()
    }
  }

  private onChangeTab = (event: MdsTabEventDetail): void => {
    if (event.value) {
      this.sortFiles(this.files, AttachmentSort[event.value])
      this.userSort = AttachmentSort[event.value]
      localStorage.setItem(LOCALSTORAGE_KEY_USER_SORT, this.userSort)
    }
  }
  /**
   * Prepare file to be submitted.
   * Limit number of file to maxFiles
   * Check size and type for every single file.
   * @param fileList list recieved from input selection or drag and drop
   * @returns list of files accepted
   */
  private prepareFiles (fileList: FileList | null): FileList | null {
    if (!fileList) return null
    const files = Array.from(fileList)
    const data = new DataTransfer()
    const f = this.files
    // prepare new file added
    for (const file of files) {
      // update only file not added previously file with errors
      this.id += 1
      const index = this.files.findIndex(f => f.key === hashValue(file.name + file.size))
      if (index === -1 || this.files[index].status !== Status.SUCCESS) {
        let error = ''
        if (this.fileUploaded >= this.maxFiles) {
          error = 'Numero massimo di file raggiunto.'
        }
        if (!this.checkFileSize(file)){
          error = 'File troppo grande.'
        }
        if (!this.checkFileType(file)){
          error = 'Formato non consentito.'
        }
        if (!error) {
          f.push({ key: hashValue(file.name + file.size), file, id: this.id, status: Status.SUCCESS })
          this.fileUploaded += 1
        } else {
          f.push({ key: hashValue(file.name + file.size), file, id: this.id, status: Status.ERROR, errorMessage: error })
        }
      }
    }
    // show uploadable file before the others with error
    // f.sort(this.sortByStatusAndName)
    // f.sort(this.sortById)
    // set input.files only uploadable file
    f.filter(f => f.status === Status.SUCCESS).forEach(f => data.items.add(f.file))
    this.sortFiles(f, this.sort ?? this.userSort)
    this.updateProgress()
    return data.files
  }

  /**
   * Update progress bar
   */
  private updateProgress () {
    const nFile = this.files.map(fileStatus => (fileStatus.status === Status.SUCCESS ? 1 : 0) as number).reduce((prev, curr) => prev + curr, 0)
    this.progress = nFile / this.maxFiles
  }

  /**
   * Sort recieved file and assign the result to this.files for update render
   *
   * @param files current list of files to be sorted
   * @param sort type of sorting
   */
  private sortFiles (files: FileStatus[], sort: AttachmentSort): void {
    if (sort === AttachmentSort.date) {
      this.files = files.slice().sort(this.sortById)
    }
    if (sort === AttachmentSort.status){
      this.files = files.slice().sort(this.sortByStatusAndName)
    }
  }

  private checkFileSize (file: File): boolean {
    return file.size < this.maxFileSize * 1024 * 1024
  }

  private checkFileType (file: File): boolean {
    const acceptArray = this.accept.replace(/ /g, '').split(',')
    // controllo mime type univoco (es. image/png)
    if (acceptArray.includes(file.type)) return true
    // controllo mime type multiestensione (es. image/*)
    if (
      acceptArray.filter(value => new RegExp(value.replace('*', '.*')).test(file.type)).length > 0
    ) return true
    // controllo estensione
    if (acceptArray.includes(`.${file.name.split('.').pop()}`)) return true
    return false
  }

  private getExtension (): string {
    return this.accept.replace(/ /g, '').split(',')
      .flatMap(mtype => {
        // replace generic mime-type with related extensions
        if (mtype.includes('*')) {
          return [...genericMimeToExt.get(mtype.split('/')[0]) ?? '']
        }
        return mtype
      })
      // format string
      .map(mtype => (mtype.includes('.') ? mtype.slice(1) : Mime.getExtension(mtype)))
      .join(', ').toUpperCase()
  }

  private sortByStatusAndName (a: FileStatus, b: FileStatus): number {
    if (a.status === b.status) {
      return a.file.name.localeCompare(b.file.name)
    }
    return a.status === Status.SUCCESS ? -1 : 1
  }

  private sortById (a: FileStatus, b: FileStatus): number {
    return b.id - a.id
  }

  render () {
    return (
      <Host>
        <div class="drag-area"
          onDrop={this.onDropHandler}
          onDragOver={this.onDragOverHandler}
          onDragEnter={this.onDragEnterHandler}
          onDragLeave={this.onDragLeaveHandler}
          ref={ dragArea => this.elDragArea = dragArea}
        >
          <div class="main-action">
            <div class="main-action-icon">
              <i class="svg icon" innerHTML={miBaselineAddCircle}/>
            </div>
            <mds-text animation="yugop" variant="title" typography="action" text={ this.actionTitle }></mds-text>
          </div>
          <div class="main-actions">
            <mds-button variant='primary' onClick={() => this.nativeInput?.click()}> {this.files ? 'Aggiungi file' : 'Seleziona File'}</mds-button>
            {this.files.length > 0 && <mds-button variant='error' onClick={this.onReset}>Cancella tutto</mds-button> }
          </div>
          <div class="main-infos">
            <mds-progress class="progress-bar" progress={this.progress}></mds-progress>
            <mds-text variant="info" typography="caption">Puoi caricare fino a {this.maxFiles} file</mds-text>
          </div>
        </div>
        <input type='file' accept={this.accept} hidden ref={i => this.nativeInput = i} onChange={this.onAdd} multiple = {this.maxFiles > 1}/>
        <div class="additional-infos">
          <div class="file-specs">
            <mds-text variant="info" typography="caption">{this.extensions !== '' ? 'Puoi caricare ' + this.extensions : 'Puoi caricare qualsiasi formato'}</mds-text>
            <mds-text variant="info" typography="caption">{this.maxFileSize}MB max per file</mds-text>
          </div>
          {this.sort ??
            <mds-tab class="action-sort" onMdsTabChange={event => this.onChangeTab(event.detail)} >
              <mds-tab-item icon={iconSortById} selected title="Ordine per data di aggiunta" value={AttachmentSort.date}></mds-tab-item>
              <mds-tab-item icon={iconSortByStatus} title="Raggruppa per stato" value={AttachmentSort.status}></mds-tab-item>
            </mds-tab>
          }
        </div>
        <div class={clsx('file-list', this.files.length > this.cssMinCols && 'file-list--more-items')}>
          {this.files.map(file =>
          {
            switch (file.status) {
            case Status.ERROR:
              return (
                <mds-file-preview variant="error" filename={file.file.name} filesize={file.file.size.toString()} message={file.errorMessage}></mds-file-preview>
              )
            case Status.SUCCESS:
              return (
                <mds-file-preview deletable filename={file.file.name} filesize={file.file.size.toString()} onMdsFileDelete={() => this.onCancel(file.key)} src={URL.createObjectURL(file.file)}></mds-file-preview>
              )
            }
          },
          )}
        </div>
      </Host>
    )
  }

}
