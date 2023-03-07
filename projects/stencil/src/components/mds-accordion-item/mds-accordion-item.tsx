import { Component, Host, h, Prop, Element, Event, EventEmitter } from '@stencil/core'
import { TypographyTitleType } from '@type/typography'
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'
import { AccordionClickedEvent } from '../mds-accordion/meta/interface'

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
   * Specifies if the accordion item is opened or not
   */
  @Prop({ mutable: true, reflect: true }) opened?: boolean

  /**
   * Specifies the title shown when the accordion is closed or opened
   */
  @Prop() readonly description!: string

  private toggle = () => {
    this.opened = !this.opened
    this.openedEvent.emit({ id: this.element.id, opened: this.opened })
  }

  /**
   * Emits when the accordion is opened
   */
  @Event({ eventName: 'mdsAccordionItemOpen' }) openedEvent: EventEmitter<AccordionClickedEvent>

  render () {
    return (
      <Host>
        <button aria-controls="contents" aria-expanded={ this.opened ? 'true' : 'false' } class="action focusable" id="action" onClick={ this.toggle } role="button" tabindex="0">
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
