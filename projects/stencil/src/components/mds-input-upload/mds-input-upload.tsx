import { AttachInternals, Component, Host, Prop, State, h } from '@stencil/core'
import miBaselineAddCircle from '@icon/mi/baseline/add-circle.svg'
import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import miBaselineDone from '@icon/mi/baseline/done.svg'
import miBaselineError from '@icon/mi/baseline/error.svg'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import miBaselineReplay from '@icon/mi/baseline/replay.svg'
import { KeyboardManager } from '@common/keyboard-manager'
import { hashValue } from '@common/aria'
import Mime from 'mime'

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

  // @Element() private element: HTMLMdsInputUploadElement
  @State() actionTitle: string = this.mainActionTitle.default

  /**
   * Defines the file types the file input should accept
   */
  @Prop() accept!: string

  /**
   * Specifies the max size of a single file that can be uploaded in MB
   */
  @Prop() maxFileSize = 20

  /**
   * Specifies the max number of files that can be uploaded
   */
  @Prop() maxFiles = 5

  /**
   * Specifies if its possible to upload multiple file
   */
  @Prop() multiple = false

  @AttachInternals() internals: ElementInternals
  @State() files: FileStatus[] = []

  private nativeInput?: HTMLInputElement
  private elDragArea?: HTMLElement

  private km = new KeyboardManager()

  private extensions: string
  private progress: number


  componentWillLoad (): void {
    if (!this.multiple) {
      this.maxFiles = 1
    }
    this.extensions = this.accept.split(',').map(mtype => (mtype.includes('.') ? mtype.slice(1) : Mime.getExtension(mtype))).join(', ').toUpperCase()
  }

  componentDidLoad (): void {
    if (this.elDragArea){
      this.km.addElement(this.elDragArea)
      this.km.attachClickBehavior()
    }
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  private onDropHandler = (event: DragEvent) => {
    if (this.nativeInput && event.dataTransfer) {
      this.nativeInput.files = event.dataTransfer.files
      const f = this.prepareFiles(event.dataTransfer.files)
      this.nativeInput.files = f
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

  private onChangeInput = (event: Event) => {
    const input = ((event.target) as HTMLInputElement)
    input.files = this.prepareFiles(input.files)
    this.internals.setFormValue(input.value)
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
    this.progress = 0
    let files = Array.from(fileList)

    if (files.length >= this.maxFiles) {
      console.info(`numero massimo di file raggiunto, verranno caricati solo i primi ${this.maxFiles} file`)
      files = files.slice(0, this.maxFiles)
    }
    const data = new DataTransfer()
    const f: FileStatus[] = []
    for (const file of files) {
      let error = ''
      if (!this.checkFileSize(file)){
        error += 'File troppo grande.'
      }
      if (!this.checkFileType(file)){
        error += 'Formato non supportato.'
      }
      if (!error){
        data.items.add(file)
        const reader = new FileReader()
        // success
        reader.onload = () => {
          this.updateFileSatus(file, Status.SUCCESS)
        }
        reader.onerror = () => {
          this.updateFileSatus(file, Status.ERROR)
        }
        f.push({ key: hashValue(file.name + file.size), file, status: Status.UPLOADING })
        reader.readAsArrayBuffer(file)
      } else {
        f.push({ key: hashValue(file.name + file.size), file, status: Status.ERROR, errorMessage: error })
      }
    }
    this.files = f
    return data.files
  }

  private updateFileSatus (file: File, status: Status) {
    const index = this.files.findIndex(f => f.key === hashValue(file.name + file.size))
    const f = this.files[index]
    this.files[index] = { ...f, status }
    // update progress bar
    const fileDone = this.files.map(fileStatus => (fileStatus.status === Status.UPLOADING ? 0 : 1) as number).reduce((prev, curr) => prev + curr)
    this.progress = this.files.length / fileDone
    // necessary assignment for trigger render
    this.files = [...this.files]
  }

  private checkFileSize (file: File): boolean {
    return file.size < this.maxFileSize * 1024 * 1024
  }

  private checkFileType (file: File): boolean {
    const acceptArray = this.accept.split(',')
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

  render () {
    return (
      <Host>
        <div class="drag-area"
          onDrop={this.onDropHandler}
          onDragOver={this.onDragOverHandler}
          onDragEnter={this.onDragEnterHandler}
          onDragLeave={this.onDragLeaveHandler}
          onClick={() => this.nativeInput?.click()}
          ref={ dragArea => this.elDragArea = dragArea}
        >
          <div class="main-action">
            <div class="main-action-icon">
              <i class="svg icon" innerHTML={miBaselineAddCircle}/>
            </div>
            <mds-text animation="yugop" variant="title" typography="action" text={ this.actionTitle }></mds-text>
          </div>
          <div class="main-infos">
            { this.progress !== undefined && <mds-progress class="progress-bar" progress={this.progress}></mds-progress> }
            <mds-text variant="info" typography="caption">Puoi caricare fino a {this.maxFiles} file</mds-text>
          </div>
        </div>
        <input type='file' accept={this.accept} hidden ref={i => this.nativeInput = i} onChange={this.onChangeInput} multiple = {this.multiple}/>
        <div class="additional-infos">
          <mds-text variant="info" typography="caption">{this.extensions !== '' ? 'Puoi caricare ' + this.extensions : 'Puoi caricare qualsiasi formato'}</mds-text>
          <mds-text variant="info" typography="caption">{this.maxFileSize}MB max per file</mds-text>
        </div>
        <div class="file-list">
          {this.files.map(file =>
          {
            switch (file.status) {
            case Status.UPLOADING :
              return (
                <mds-entity await>
                  <mds-text aria-label="Nome" truncate="word" typography="h6">{file.file.name}</mds-text>
                  <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Upload in corso...</mds-text>
                  <mds-button class="action action--cancel-upload" slot="action" icon={miBaselineCancel} title="Annulla upload" tone="quiet" variant="dark"></mds-button>
                </mds-entity>
              )
            case Status.ERROR:
              return (
                <mds-entity icon={miBaselineError} tone="weak" variant="error">
                  <mds-text aria-label="Nome" truncate="word" typography="h6">{file.file.name}</mds-text>
                  <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Errore caricamento. {file.errorMessage}</mds-text>
                  <mds-button class="action action--retry-upload" slot="action" icon={miBaselineReplay} title="Ritenta upload" tone="quiet" variant="dark"></mds-button>
                </mds-entity>
              )
            case Status.ABORT:
              return (
                <mds-entity icon={miBaselineClose} tone="weak" variant="warning">
                  <mds-text aria-label="Nome" truncate="word" typography="h6">{file.file.name}</mds-text>
                  <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Upload annullato</mds-text>
                </mds-entity>
              )
            case Status.SUCCESS:
              return (
                <mds-entity icon={miBaselineDone} tone="weak" variant="success">
                  <mds-text aria-label="Nome" truncate="word" typography="h6">{file.file.name}</mds-text>
                  <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Upload completato</mds-text>
                </mds-entity>
              )
            }
          },
          )}
        </div>
      </Host>
    )
  }

}
