import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { LabelVariantType } from '../../types/variant'
import miBaselineClose from '@icon/mi/baseline/close.svg'

@Component({
  tag: 'mds-note',
  styleUrl: 'mds-note.css',
  shadow: true,
})
export class MdsNote {

  @Element() private hostElement: HTMLMdsNoteElement

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean = false

  /**
   * Specifies the color variant for the element
   */
  @Prop() readonly variant?: LabelVariantType = 'yellow'

  private onClickClose = (ev: Event) => {
    ev.stopPropagation()
    ev.preventDefault()
    this.clickClose.emit(this.hostElement)
  }

  /**
   * Emits when the note has to be cancelled
   */
  @Event() clickClose: EventEmitter<HTMLMdsNoteElement>

  render () {
    return (
      <Host>
        { this.deletable && <i innerHTML={miBaselineClose} class="svg close" onClick={ this.onClickClose.bind(this) }/> }
        <slot name="title"/>
        <slot/>
        <div class="fold"/>
      </Host>
    )
  }
}
