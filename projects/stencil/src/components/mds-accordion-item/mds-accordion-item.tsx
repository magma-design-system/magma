import miBaselineKeyboardArrowRight from '@icon/mi/baseline/keyboard-arrow-right.svg';
import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { TypographyTitleType } from '@type/typography';
import { MdsAccordionItemEventDetail } from './meta/event-detail';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - Add contents like `text string`, `HTML elements` or `components` to this slot.
 * @part content - the content wrapper of the `default` slot
 * @part icon - The arrow icon of the component
 * @part label - The text label of the component
 */

@Component({
  tag: 'mds-accordion-item',
  styleUrl: 'mds-accordion-item.css',
  shadow: true,
})
export class MdsAccordionItem {
  @Element() private element: HTMLMdsAccordionItemElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
    this.unsubscribePrefContrast = subscribePreference('contrast', (value) => {
      this.prefContrast = value;
    });
    this.unsubscribePrefTheme = subscribePreference('theme', (value) => {
      this.prefTheme = value;
    });
    this.unsubscribePrefThemeScheme = subscribePreference('theme-scheme', (value) => {
      this.prefThemeScheme = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
    this.unsubscribePrefContrast?.();
    this.unsubscribePrefTheme?.();
    this.unsubscribePrefThemeScheme?.();
  }

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyTitleType = 'h5';

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
    return (
      <Host
        pref-animation={this.prefAnimation}
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        <button
          aria-controls="content"
          aria-expanded={this.selected ? 'true' : 'false'}
          class="action"
          id="action"
          onClick={this.toggle}
          role="button"
          tabindex="0"
        >
          <mds-text typography={this.typography} part="label">
            {this.label}
          </mds-text>
          <mds-text aria-hidden="true" class="icon-button" typography={this.typography} part="icon">
            <i class="icon" innerHTML={miBaselineKeyboardArrowRight} />
          </mds-text>
        </button>
        <div class="content" id="content">
          <div aria-labelledby="action" class="content-expander" part="content" role="region">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
