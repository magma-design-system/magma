import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core'
import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import { setAttributeIfEmpty } from '@common/aria'
import { MdsChipEvent } from './meta/interface'
import { KeyboardManager } from '@common/keyboard-manager'
import { ChipVariantType, ToneMinimalVariantType } from '@type/variant'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

@Component({
  tag: 'mds-chip',
  styleUrl: 'mds-chip.css',
  shadow: true,
})
export class MdsChip {

  @Element() host: HTMLMdsChipElement
  private km = new KeyboardManager()
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  /**
   * Adds ARIA support to the element if has interaction
   */
  @Prop({ reflect: true, mutable: true }) clickable?: boolean

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean

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
  @Prop({ reflect: true }) readonly label!: string

  /**
   * Sets the component selected
   */
  @Prop({ reflect: true, mutable: true }) selected?: boolean = false

  /**
   * Sets if the component change is status to selected when is clicked
   */
  @Prop({ reflect: true }) readonly selectable?: boolean = false

  /**
   * Sets the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ChipVariantType = 'primary'

  /**
   * Sets the color variant tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'strong'

  /**
   * Emits when the component's label is clicked
   */
  @Event({ eventName: 'mdsChipClickLabel' }) clickLabelEvent: EventEmitter<MdsChipEvent>

  /**
   * Emits when the component's delete button is clicked
   */
  @Event({ eventName: 'mdsChipDelete' }) deleteEvent: EventEmitter<MdsChipEvent>

  @Watch('selectable')
  handleSelectableProp (newValue: boolean): void {
    if (newValue) {
      this.clickable = true
    }
  }

  @Watch('clickable')
  handleClickableProp (newValue: boolean): void {
    this.handleClickableElement(newValue)
    this.handleClickableKeyboard(newValue)
  }

  @Watch('deletable')
  handleDeletableProp (newValue: boolean): void {
    this.handleDeletableElement(newValue)
    this.handleDeletableKeyboard(newValue)
  }

  private onClickLabelHandler (event: Event): void {
    this.clickLabelEvent.emit({ event, element: this.host })
    if (this.selectable) {
      this.selected = !this.selected
    }
  }

  private onDeleteHandler (event: Event): void {
    this.deleteEvent.emit({ event, element: this.host })
  }

  private handleClickableKeyboard = (isClickable: boolean): void => {
    if (isClickable) {
      const label = this.host.shadowRoot?.querySelector('.label') as HTMLElement
      this.km.addElement(label, 'label')
      this.km.attachClickBehavior('label')
      return
    }
    this.km.detachClickBehavior('label')
  }

  private handleDeletableKeyboard = (isDeletable: boolean): void => {
    if (isDeletable) {
      const deleteElement = this.host.shadowRoot?.querySelector('.button-delete') as HTMLElement
      this.km.addElement(deleteElement, 'delete')
      this.km.attachClickBehavior('delete')
      return
    }
    this.km.detachClickBehavior('delete')
  }

  private handleClickableElement = (isClickable: boolean): void => {
    const label = this.host.shadowRoot?.querySelector('.label') as HTMLElement
    if (!label) {
      return
    }
    if (isClickable) {
      setAttributeIfEmpty(label, 'role', 'button')
      label.addEventListener('click', this.onClickLabelHandler.bind(this))
      return
    }
    label.removeAttribute('role')
    label.removeEventListener('click', this.onClickLabelHandler.bind(this))
  }

  private handleDeletableElement = (isDeletable: boolean): void => {
    const deleteElement = this.host.shadowRoot?.querySelector('.button-delete') as HTMLElement
    if (!deleteElement) {
      return
    }
    if (isDeletable) {
      deleteElement.addEventListener('click', this.onDeleteHandler.bind(this))
      return
    }
    deleteElement.removeAttribute('aria-hidden')
    deleteElement.removeEventListener('click', this.onDeleteHandler.bind(this))
  }

  componentWillLoad (): void {
    this.t.lang(this.host)
  }

  componentDidLoad (): void {
    if (this.clickable) {
      this.handleClickableElement(true)
      this.handleClickableKeyboard(true)
    }
    if (this.deletable) {
      this.handleDeletableElement(true)
      this.handleDeletableKeyboard(true)
    }
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
          ? <mds-text class="label label--interactive" tabindex="0" typography="caption" truncate="word">
            { this.label }
          </mds-text>
          : <mds-text class="label" typography="caption" truncate="word">
            { this.label }
          </mds-text>
        }
        { this.deletable && <mds-button class="button-delete" icon={miBaselineCancel} onClick={this.onDeleteHandler.bind(this)} title={ `${this.t.get('deleteLabel')} ${this.label}` } variant="dark" tone="quiet" size="sm"></mds-button> }
      </Host>
    )
  }
}
