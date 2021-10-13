import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { LabelVariantType } from '../../types/variant'
import clsx from 'clsx'

@Component({
  tag: 'mds-note',
  styleUrl: 'mds-note.css',
  shadow: true,
})
export class MdsNote {

  private hasTitle: boolean
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

  componentWillLoad (): void {
    this.hasTitle = this.hostElement.querySelector('[slot="title"]') !== null
  }

  render () {
    return (
      <Host class={clsx(!this.hasTitle && this.deletable && 'mds-note--close-outside')}>
        { this.hasTitle &&
          <div class="title">
            <slot name="title"/>
            { this.deletable && <mds-icon name="close" class="close" onClick={ this.onClickClose.bind(this) }/> }
          </div>
        }
        { !this.hasTitle && this.deletable && <mds-icon name="close" class="close" onClick={ this.onClickClose.bind(this) }/> }
        <slot/>
        <div class="fold"/>
      </Host>
    )
  }
}
