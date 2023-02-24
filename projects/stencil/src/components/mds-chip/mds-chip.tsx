import { Component, Element, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core'
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
  private labelAction: HTMLElement
  private iconElement: HTMLElement
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
    this.iconElement = this.host.shadowRoot.querySelector('.svg svg')
    this.km.addElement(this.labelAction, 'label')
    this.km.addElement(this.iconElement, 'close')

    if (this.clickable) {
      this.addActionBehavior()
    }

    if (this.deletable) {
      this.addDeleteBehavior()
    }
  }

  disconnectedCallback ():void {
    if (this.clickable) {
      this.removeActionBehavior()
    }

    if (this.deletable) {
      this.removeDeleteBehavior()
    }
  }

  private addActionBehavior (): void {
    setAttributeIfEmpty(this.labelAction, 'role', 'button')
    this.labelAction.addEventListener('click', this.onLabelClickHandler.bind(this))
    this.km.attachClickBehavior('label')
  }

  private addDeleteBehavior (): void {
    setAttributeIfEmpty(this.iconElement, 'aria-hidden', 'true')
    this.km.attachClickBehavior('close')
  }

  private removeActionBehavior (): void {
    this.labelAction.removeAttribute('role')
    this.labelAction.removeEventListener('click', this.onLabelClickHandler.bind(this))
    this.km.detachClickBehavior('label')
  }

  private removeDeleteBehavior (): void {
    this.km.detachClickBehavior('close')
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
      this.addActionBehavior()
      return
    }
    this.removeActionBehavior()
  }

  @Watch('deletable')
  deletableChanged (newValue: boolean): void {
    if (newValue) {
      this.addDeleteBehavior()
    }
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
          ? <mds-text class="label focusable" tabindex="0" typography="caption" truncate={true}>
            { this.label }
          </mds-text>
          : <mds-text class="label" typography="caption" truncate={true}>
            { this.label }
          </mds-text>
        }
        { this.deletable && <i class="svg delete focusable" innerHTML={miBaselineCancel} onClick={this.onDeleteHandler.bind(this)} role="button" tabindex="0" title={ `${this.deleteLabel} ${this.label}` }/> }
      </Host>
    )
  }
}
