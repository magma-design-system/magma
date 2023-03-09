import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'
import { AccordionClickedEvent } from '../mds-accordion/meta/interface'
import { Component, Host, h, Prop, Element, Event, EventEmitter } from '@stencil/core'
import { TypographyTitleType } from '@type/typography'

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
  @Prop() readonly typography?: TypographyTitleType = 'h5'

  /**
   * Specifies if the accordion item is selected or not
   */
  @Prop({ mutable: true, reflect: true }) selected?: boolean

  /**
   * Specifies the title shown when the accordion is closed or selected
   */
  @Prop() readonly description!: string

  private toggle = () => {
    this.selected = !this.selected
    this.selectedEvent.emit({ id: this.element.id, selected: this.selected })
  }

  /**
   * Emits when the accordion is selected
   */
  @Event({ eventName: 'mdsAccordionItemSelect' }) selectedEvent: EventEmitter<AccordionClickedEvent>

  render () {
    return (
      <Host>
        <button aria-controls="contents" aria-expanded={ this.selected ? 'true' : 'false' } class="action focusable" id="action" onClick={ this.toggle } role="button" tabindex="0">
          <mds-text typography={ this.typography }>
            { this.description }
          </mds-text>
          <mds-text aria-hidden="true" class="icon-button" typography={ this.typography }>
            <i class="svg icon" innerHTML={miBaselineKeyboardArrowUp}/>
          </mds-text>
        </button>
        <div aria-labelledby="action" class="contents" id="contents" role="region">
          <slot/>
        </div>
      </Host>
    )
  }

}
