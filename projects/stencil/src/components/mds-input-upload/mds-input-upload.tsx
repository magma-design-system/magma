import Mime from 'mime'
import clsx from 'clsx'
import miBaselineAddCircle from '@icon/mi/baseline/add-circle.svg'
import { AttachInternals, Component, Element, Host, Prop, State, h } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { hashValue } from '@common/aria'

enum Status {
  UPLOADING,
  ERROR,
  ABORT,
  SUCCESS
}

interface FileStatus {
  key: string,
  file: File,
  status: Status,
  errorMessage?: string
}

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
  private km = new KeyboardManager()
  private extensions: string
  private fileUploaded = 0
  private cssMinCols: number = 1000

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

  componentWillLoad (): void {
    this.extensions = this.accept.split(',').map(mtype => (mtype.includes('.') ? mtype.slice(1) : Mime.getExtension(mtype))).join(', ').toUpperCase()
  }

  componentDidLoad (): void {
    if (this.elDragArea){
      this.km.addElement(this.elDragArea)
      this.km.attachClickBehavior()
    }
    this.updateCSSCustomProps()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
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
      this.internals.setFormValue(null)
      this.fileUploaded = 0
      this.updateProgress()
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
    const f = [...this.files]
    // prepare new file added
    for (const file of files) {
      // update only file not added previously file with errors
      const index = this.files.findIndex(f => f.key === hashValue(file.name + file.size))
      if (index === -1 || this.files[index].status !== Status.SUCCESS) {
        let error = ''
        if (this.fileUploaded >= this.maxFiles) {
          error += 'Numero massimo di file raggiunto.'
        }
        if (!this.checkFileSize(file)){
          error += 'File troppo grande.'
        }
        if (!this.checkFileType(file)){
          error += 'Formato non supportato.'
        }
        if (!error) {
          f.push({ key: hashValue(file.name + file.size), file, status: Status.SUCCESS })
          this.fileUploaded += 1
        } else {
          f.push({ key: hashValue(file.name + file.size), file, status: Status.ERROR, errorMessage: error })
        }
      }
    }
    // show uploadable file before the others with error
    f.sort(this.sortByStatusAndName)
    // set input.files only uploadable file
    f.slice(0, this.maxFiles).forEach(f => data.items.add(f.file))
    this.files = f
    this.updateProgress()
    return data.files
  }

  private updateProgress () {
    // update progress bar
    const nFile = this.files.map(fileStatus => (fileStatus.status === Status.SUCCESS ? 1 : 0) as number).reduce((prev, curr) => prev + curr, 0)
    this.progress = nFile / this.maxFiles
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

  private sortByStatusAndName (a: FileStatus, b: FileStatus): number {
    if (a.status === b.status) {
      return a.file.name.localeCompare(b.file.name)
    }
    return a.status === Status.SUCCESS ? -1 : 1
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
          <mds-text variant="info" typography="caption">{this.extensions !== '' ? 'Puoi caricare ' + this.extensions : 'Puoi caricare qualsiasi formato'}</mds-text>
          <mds-text variant="info" typography="caption">{this.maxFileSize}MB max per file</mds-text>
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
