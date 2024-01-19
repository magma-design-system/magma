import { Component, Host, Element, State, h } from '@stencil/core'
import miBaselineAddCircle from '@icon/mi/baseline/add-circle.svg'
import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import miBaselineReplay from '@icon/mi/baseline/replay.svg'

@Component({
  tag: 'mds-input-upload',
  styleUrl: 'mds-input-upload.css',
  shadow: true,
})
export class MdsInputUpload {
  
  private mainActionTitle = {
    default: 'Clicca o trascina qui per selezionare i file da caricare',
    uploading: 'Caricamento in corso...',
    dragEnter: 'Rilascia qui per iniziare il caricamento',
    end: 'Caricamento completato',
  }

  @Element() private element: HTMLMdsInputUploadElement
  @State() actionTitle: string = this.mainActionTitle.default
  private elDragArea: HTMLElement | null | undefined

  private onDropHandler = (event: DragEvent) => {
    console.info(event)
  }

  private onDragOverHandler = (event: DragEvent) => {
    console.info(event)
  }

  private onDragEnterHandler = (event: DragEvent) => {
    this.actionTitle = this.mainActionTitle.dragEnter
    this.elDragArea?.classList.add('drag-area--on-drag-enter')
    console.info(event)
  }

  private onDragLeaveHandler = (event: DragEvent) => {
    this.actionTitle = this.mainActionTitle.default
    this.elDragArea?.classList.remove('drag-area--on-drag-enter')
    console.info(event)
  }

  componentDidLoad = (): void => {
    this.elDragArea = this.element.shadowRoot?.querySelector('.drag-area')
  }

  render () {
    return (
      <Host>
        <div class="drag-area"
          onDrop={this.onDropHandler}
          onDragOver={this.onDragOverHandler}
          onDragEnter={this.onDragEnterHandler}
          onDragLeave={this.onDragLeaveHandler}
        >
          <div class="main-action">
            <div class="main-action-icon">
              <i class="svg icon" innerHTML={miBaselineAddCircle}/>
            </div>
            <mds-text variant="title" typography="action">{ this.actionTitle }</mds-text>
          </div>
          <div class="main-infos">
            <mds-progress class="progress-bar" progress={0.4}></mds-progress>
            <mds-text variant="info" typography="caption">Puoi caricare fino a 20 file</mds-text>
          </div>
        </div>
        <div class="additional-infos">
          <mds-text variant="info" typography="caption">Puoi caricare PNG, JPEG o WPIC</mds-text>
          <mds-text variant="info" typography="caption">20MB max per file</mds-text>
        </div>
        <div class="file-list">
          <mds-entity await>
            <mds-text aria-label="Nome" truncate="word" typography="h6">Report finanziario 2024.docx</mds-text>
            <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Upload in corso...</mds-text>
            <mds-button class="action-select-file" slot="action" title="Annulla upload" tone="quiet" variant="dark"><i class="svg icon-cancel" innerHTML={miBaselineCancel}/></mds-button>
          </mds-entity>
          <mds-entity icon="mi/baseline/error" tone="weak" variant="error">
            <mds-text aria-label="Nome" truncate="word" typography="h6">Report finanziario 2024.docx</mds-text>
            <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Errore caricamento</mds-text>
            <mds-button class="action-select-file" slot="action" title="Ritenta upload" tone="quiet" variant="dark"><i class="svg icon-cancel" innerHTML={miBaselineReplay}/></mds-button>
          </mds-entity>
          <mds-entity icon="mi/outline/do-not-disturb-on" tone="weak" variant="warning">
            <mds-text aria-label="Nome" truncate="word" typography="h6">Report finanziario 2024.docx</mds-text>
            <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Upload annullato</mds-text>
          </mds-entity>
          <mds-entity icon="mi/baseline/done" tone="weak" variant="success">
            <mds-text aria-label="Nome" truncate="word" typography="h6">Report finanziario 2024.docx</mds-text>
            <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Upload completato</mds-text>
          </mds-entity>
        </div>
      </Host>
    )
  }

}
