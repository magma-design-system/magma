import { Component, Host, h, Prop, Element, Event, EventEmitter } from '@stencil/core'
import { TypographyPrimaryType } from '../../types/typography'
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'

@Component({
  tag: 'mds-accordion-item',
  styleUrl: 'mds-accordion-item.css',
  shadow: true,
})
export class MdsAccordionItem {

  @Element() private element: HTMLMdsAccordionItemElement

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyPrimaryType = 'h5'

  /**
   * Specifies if the accordion item is opened or not
   */
  @Prop({ mutable: true, reflect: true }) opened?: boolean

  /**
   * Specifies the title shown when the accordion is closed or opened
   */
  @Prop() readonly description!: string

  private toggle = () => {
    this.opened = !this.opened
    this.openedEvent.emit(this.element.id)
  }

  /**
   * Emits when the accordion is opened
   */
  @Event() openedEvent: EventEmitter<string>

  render () {
    return (
      <Host>
        <mds-grid class="header" onClick={ this.toggle }>
          <mds-text typography={ this.typography }>{ this.description }</mds-text>
          <mds-text class="icon-button" typography={ this.typography }>
            <i class="svg icon" innerHTML={miBaselineKeyboardArrowUp}/>
          </mds-text>
        </mds-grid>
        <div class="contents">
          <slot/>
        </div>
      </Host>
    )
  }

}
