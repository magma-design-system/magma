import { Component, Element, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core'
import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import { setAttributeIfEmpty } from '@common/aria'
import { MdsChipEvent } from './meta/interface'


@Component({
  tag: 'mds-chip',
  styleUrl: 'mds-chip.css',
  shadow: true,
})
export class MdsChip {

  @Element() host: HTMLMdsChipElement
  private labelAction: HTMLElement

  /**
   * Adds ARIA support to the element if has interaction
   */
  @Prop() readonly clickable?: boolean

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deleteLabel? = 'Rimuovi'

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly disabled?: boolean = false

  /**
   * The icon displayed to the left of the component's label
   */
  @Prop() readonly icon?: string

  /**
   * The label displayed to the right of the component's icon
   */
  @Prop() readonly label!: string

  /**
   * Emits when the component's label is clicked
   */
  @Event() labelClick: EventEmitter<MdsChipEvent>

  /**
   * Emits when the component's delete button is clicked
   */
  @Event() delete: EventEmitter<MdsChipEvent>

  componentDidLoad ():void {
    this.labelAction = this.host.shadowRoot.querySelector('.label')
    if (this.clickable) {
      this.addActionAttributes()
    }
  }

  disconnectedCallback ():void {
    if (this.clickable) {
      this.labelAction.removeEventListener('click', this.onLabelClickHandler.bind(this))
    }
  }

  private addActionAttributes (): void {
    setAttributeIfEmpty(this.labelAction, 'role', 'button')
    this.labelAction.addEventListener('click', this.onLabelClickHandler.bind(this))
  }

  private removeActionAttributes (): void {
    this.labelAction.removeAttribute('role')
    this.labelAction.removeEventListener('click', this.onLabelClickHandler)
  }

  private onLabelClickHandler (event: Event): void {
    this.labelClick.emit({ event, element: this.host })
  }

  private onDeleteHandler (event: Event): void {
    this.delete.emit({ event, element: this.host })
  }

  @Watch('clickable')
  clickableChanged (newValue: boolean): void {
    if (newValue) {
      this.addActionAttributes()
      return
    }
    this.removeActionAttributes()
  }

  render () {
    return (
      <Host>
        { this.icon &&
          <div aria-hidden="true" class="icon-area">
            <mds-icon class="icon" name={this.icon} />
          </div>
        }
        <mds-text class="label" tabindex="0" typography="caption">
          { this.label }
        </mds-text>
        { this.deletable && <i aria-label={ this.deleteLabel } class="svg delete" innerHTML={miBaselineCancel} onClick={this.onDeleteHandler.bind(this)} role="button" tabindex="0" title={ `${this.deleteLabel} ${this.label}` }/> }
      </Host>
    )
  }
}
