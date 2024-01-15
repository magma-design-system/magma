import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import { setAttributeIfEmpty } from '@common/aria'
import { MdsChipEvent } from './meta/interface'
import { KeyboardManager } from '@common/keyboard-manager'

@Component({
  tag: 'mds-chip',
  styleUrl: 'mds-chip.css',
  shadow: true,
})
export class MdsChip {

  @Element() host: HTMLMdsChipElement
  private km = new KeyboardManager()

  /**
   * Adds ARIA support to the element if has interaction
   */
  @Prop() readonly clickable?: boolean

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean

  /**
   * Sets the cross icon accessibility label to perform cancel/delete action on element
   */
  @Prop() readonly deleteLabel? = 'Rimuovi'

  /**
   * Sets the component disabled status
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
   * Sets the component selected
   */
  @Prop({ reflect: true }) selected = false

  /**
   * Emits when the component's label is clicked
   */
  @Event({ eventName: 'mdsChipClickLabel' }) clickLabelEvent: EventEmitter<MdsChipEvent>

  /**
   * Emits when the component's delete button is clicked
   */
  @Event({ eventName: 'mdsChipDelete' }) deleteEvent: EventEmitter<MdsChipEvent>

  private onClickLabelHandler (event: Event): void {
    this.clickLabelEvent.emit({ event, element: this.host })
  }

  private onDeleteHandler (event: Event): void {
    this.deleteEvent.emit({ event, element: this.host })
  }

  private handleClickableKeyboard = (): void => {
    if (this.clickable) {
      const label = this.host.shadowRoot?.querySelector('.label') as HTMLElement
      this.km.addElement(label, 'label')
      this.km.attachClickBehavior('label')
      return
    }
    this.km.detachClickBehavior('label')
  }

  private handleDeletableKeyboard = (): void => {
    if (this.deletable) {
      const deleteElement = this.host.shadowRoot?.querySelector('.delete') as HTMLElement
      this.km.addElement(deleteElement, 'delete')
      this.km.attachClickBehavior('delete')
      return
    }
    this.km.detachClickBehavior('delete')
  }

  private handleClickableElement = (): void => {
    const label = this.host.shadowRoot?.querySelector('.label') as HTMLElement
    if (!label) {
      return
    }
    if (this.clickable) {
      setAttributeIfEmpty(label, 'role', 'button')
      label.addEventListener('click', this.onClickLabelHandler.bind(this))
      return
    }
    label.removeAttribute('role')
    label.removeEventListener('click', this.onClickLabelHandler.bind(this))
  }

  private handleDeletableElement = (): void => {
    const deleteElement = this.host.shadowRoot?.querySelector('.delete') as HTMLElement
    if (!deleteElement) {
      return
    }
    if (this.deletable) {
      setAttributeIfEmpty(deleteElement, 'aria-hidden', 'true')
      deleteElement.addEventListener('click', this.onDeleteHandler.bind(this))
      return
    }
    deleteElement.removeAttribute('aria-hidden')
    deleteElement.removeEventListener('click', this.onDeleteHandler.bind(this))
  }

  componentDidLoad ():void {
    this.handleClickableElement()
    this.handleClickableKeyboard()
    this.handleDeletableElement()
    this.handleDeletableKeyboard()
  }

  componentDidUpdate ():void {
    this.handleClickableElement()
    this.handleClickableKeyboard()
    this.handleDeletableElement()
    this.handleDeletableKeyboard()
  }

  disconnectedCallback ():void {
    this.km.detachClickBehavior('label')
    this.km.detachClickBehavior('delete')
  }

  render () {
    return (
      <Host aria-disabled={this.disabled ? 'true' : 'false'}>
        { this.icon &&
          <div aria-hidden="true" class="icon-area">
            <mds-icon class="icon" name={this.icon} />
          </div>
        }
        { this.clickable
          ? <mds-text class="label focus-bounce" tabindex="0" typography="caption" truncate="word">
            { this.label }
          </mds-text>
          : <mds-text class="label" typography="caption" truncate="word">
            { this.label }
          </mds-text>
        }
        { this.deletable && <i class="svg delete focus-bounce" innerHTML={miBaselineCancel} onClick={this.onDeleteHandler.bind(this)} role="button" tabindex="0" title={ `${this.deleteLabel} ${this.label}` }/> }
      </Host>
    )
  }
}
