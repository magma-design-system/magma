import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import { TypographySmallerType } from '@type/typography';
import { readSlottedLabel, sanitizeLabel } from '@common/slot';

/**
 * @slot - **Deprecated**, use the `label` property instead. Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-tab-bar-item',
  styleUrl: 'mds-tab-bar-item.css',
  shadow: true,
})
export class MdsTabBarItem {
  @Element() private element: HTMLMdsTabItemElement;
  @State() isSelected: boolean;

  /**
   * The icon displayed in the tab bar item.
   */
  @Prop() readonly icon: string = '';

  /**
   * Sets the label of the tab bar item
   */
  @Prop({ mutable: true, reflect: true }) label?: string;

  /**
   * Specifies if the component is selected or not
   */
  @Prop({ mutable: true, reflect: true }) selected: boolean;

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographySmallerType = 'tip';

  componentWillLoad(): void {
    this.isSelected = this.selected;
  }

  private select = () => {
    this.isSelected = !this.isSelected;
    if (this.isSelected) {
      this.selectedEvent.emit(this.element.id);
    }
  };

  /**
   * Emits when the component is selected
   */
  @Event({ eventName: 'mdsTabBarItemSelect' }) selectedEvent: EventEmitter<string>;

  @Watch('selected')
  validateSelected(newValue: boolean): void {
    this.isSelected = newValue;
  }

  @Watch('label')
  labelChanged(newValue?: string): void {
    this.label = sanitizeLabel(newValue);
  }

  private onSlotChangeHandler = (): void => {
    /* this should be removed in the future once slotted text is no longer used, use the label property instead */
    if (this.label) return;
    this.label = readSlottedLabel(this.element);
  };

  render() {
    return (
      <Host onClick={this.select}>
        <mds-icon name={this.icon} />
        <mds-text typography={this.typography}>
          {this.label || <slot onSlotchange={this.onSlotChangeHandler} />}
        </mds-text>
      </Host>
    );
  }
}
