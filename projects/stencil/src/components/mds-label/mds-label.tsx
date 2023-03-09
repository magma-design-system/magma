import clsx from 'clsx'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { ThemeFullVariantType, ToneSimpleVariantType } from '@type/variant'
import { TypographyType } from '@type/typography'

@Component({
  tag: 'mds-label',
  styleUrl: 'mds-label.css',
  shadow: true,
})
export class MdsLabel {

  @Element() private host: HTMLMdsLabelElement
  private km = new KeyboardManager()


  /**
   * Specifies the ARIA label for remove element
   */
  @Prop() readonly labelAction?: string = 'Rimuovi'

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeFullVariantType = 'sky'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneSimpleVariantType = 'quiet'

  /**
   * Truncates text inside the label or displays it in multiline if needed
   */
  @Prop() readonly truncate?: boolean = true

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyType = 'caption'

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean = false

  private onClickDelete = (ev: Event) => {
    ev.stopPropagation()
    ev.preventDefault()
    this.deletedEvent.emit(this.host)
  }

  /**
   * Emits when the label has to be cancelled
   */
  @Event({ eventName: 'mdsLabelDelete' }) deletedEvent: EventEmitter<HTMLMdsLabelElement>

  private handleKeyboard = (): void => {
    if (this.deletable) {
      const close = this.host.shadowRoot.querySelector('.close') as HTMLElement
      this.km.addElement(close)
      this.km.attachClickBehavior()
      return
    }
    this.km.detachClickBehavior()
  }

  componentDidLoad ():void {
    this.handleKeyboard()
  }

  componentDidUpdate (): void {
    this.handleKeyboard()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host>
        <mds-text typography={this.typography} class={clsx('text', this.truncate && 'truncate')}>
          <slot/>
        </mds-text>
        { this.deletable && <i class="svg close focusable" innerHTML={miBaselineClose} tabindex="0" onClick={ this.onClickDelete.bind(this) } role="button" title={this.labelAction}/> }
      </Host>
    )
  }
}
