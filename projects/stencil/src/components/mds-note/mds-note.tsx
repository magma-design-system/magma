import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { LabelVariantType } from '../../types/variant'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import { KeyboardManager } from '@common/keyboard-manager'


@Component({
  tag: 'mds-note',
  styleUrl: 'mds-note.css',
  shadow: true,
})
export class MdsNote {

  @Element() private host: HTMLMdsNoteElement
  private km = new KeyboardManager()

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean = false

  /**
   * Specifies the color variant for the element
   */
  @Prop({ reflect: true }) readonly variant?: LabelVariantType = 'yellow'

  private onClickClose = () => {
    this.clickClose.emit(this.host)
  }

  /**
   * Emits when the note has to be cancelled
   */
  @Event({ eventName: 'close' }) clickClose: EventEmitter<HTMLMdsNoteElement>

  componentDidLoad ():void {
    this.km.addElement(this.host)
    this.km.attachClickBehavior()
  }

  componentDidUpdate ():void {
    if (this.deletable) {
      this.km.addElement(this.host)
      this.km.attachClickBehavior()
      return
    }

    this.km.detachClickBehavior()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host>
        { this.deletable && <i tabindex="0" role="button" title="Rimuovi" innerHTML={miBaselineClose} class="svg close focusable" onClick={ this.onClickClose.bind(this) }/> }
        <slot name="title"/>
        <slot/>
        <div class="fold"/>
      </Host>
    )
  }
}
