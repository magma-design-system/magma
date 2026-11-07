import miBaselineKeyboardArrowRight from '@icon/mi/baseline/keyboard-arrow-right.svg';
import { Component, Element, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { TypographyHeadingTagType } from '@type/text';
import { TypographyTitleType } from '@type/typography';
import { MdsAccordionItemEventDetail } from './meta/event-detail';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Add contents like `text string`, `HTML elements` or `components` to this slot.
 * @part content - the content wrapper of the `default` slot
 * @part icon - The arrow icon of the component
 * @part label - The text label of the component
 * @parent mds-accordion
 */

@Component({
  tag: 'mds-accordion-item',
  styleUrl: 'mds-accordion-item.css',
  shadow: true,
})
export class MdsAccordionItem {
  @Element() private element: HTMLMdsAccordionItemElement;

  /**
   * Specifies the typography of the title. An item is a part of the page, whose title is
   * styled as `h6` (`titles/part`, #1189): write `h6` until the default moves with the next
   * major (#1218). It is the style only: the level of the title in the outline is `tag`
   */
  @Prop() readonly typography?: TypographyTitleType = 'h5';

  /**
   * Specifies the heading level of the title, the level of its place in the outline of the
   * page (`h3` under a section titled `h2`): the heading wraps the button that opens the item,
   * as the Accordion pattern of the WAI-ARIA Authoring Practices does. Left out, the item is
   * not a heading: only the page knows its place, and the level of the style would skip the
   * levels in between
   */
  @Prop() readonly tag?: TypographyHeadingTagType;

  /**
   * Specifies if the component item is selected or not
   */
  @Prop({ mutable: true, reflect: true }) selected?: boolean;

  /**
   * Specifies the title shown when the component is closed or selected
   */
  @Prop() readonly label!: string;

  private toggle = () => {
    this.selected = !this.selected;

    this.changedEvent.emit({ id: this.element.id, selected: this.selected });

    if (this.selected) {
      this.selectedEvent.emit({ id: this.element.id, selected: this.selected });
      return;
    }

    this.unselectedEvent.emit({ id: this.element.id, selected: this.selected });
  };

  /**
   * Emits when the component is selected
   */
  @Event({ eventName: 'mdsAccordionItemSelect' })
  selectedEvent: EventEmitter<MdsAccordionItemEventDetail>;

  /**
   * Emits when the component is unselected
   */
  @Event({ eventName: 'mdsAccordionItemUnselect' })
  unselectedEvent: EventEmitter<MdsAccordionItemEventDetail>;

  /**
   * Emits when the component attribute selected is changed
   */
  @Event({ eventName: 'mdsAccordionItemChange' })
  changedEvent: EventEmitter<MdsAccordionItemEventDetail>;

  render() {
    // a button holds phrasing content only (HTML, the button element): the texts are spans
    // whatever their style, and the heading of the outline wraps the button, never the reverse
    const action = (
      <button
        aria-controls="content"
        aria-expanded={this.selected ? 'true' : 'false'}
        class="action"
        id="action"
        onClick={this.toggle}
        role="button"
        tabindex="0"
      >
        <mds-text tag="span" typography={this.typography} part="label">
          {this.label}
        </mds-text>
        <mds-text
          aria-hidden="true"
          class="icon-button"
          tag="span"
          typography={this.typography}
          part="icon"
        >
          <i class="icon" innerHTML={miBaselineKeyboardArrowRight} />
        </mds-text>
      </button>
    );

    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.tag != null ? <this.tag class="heading">{action}</this.tag> : action}
        <div class="content" id="content">
          <div aria-labelledby="action" class="content-expander" part="content" role="region">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
