import { Component, Element, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core';
import { TypographySmallerType } from '@type/typography';
import { KeyboardManager } from '@common/keyboard-manager';
import { setAttributeIfEmpty } from '@common/aria';
import { readSlottedLabel, sanitizeLabel } from '@common/slot';
import { preferenceStore } from '@common/preference';

/**
 * @slot - **Deprecated**, use the `label` property instead. Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 * @parent mds-tab-bar
 */

@Component({
  tag: 'mds-tab-bar-item',
  styleUrl: 'mds-tab-bar-item.css',
  shadow: true,
})
export class MdsTabBarItem {
  @Element() private element: HTMLMdsTabBarItemElement;
  private km = new KeyboardManager();

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

  // the item is a button that shows its view: a tab stop that Enter and Space activate as a click
  // does. A role set by the caller is theirs and stays
  componentDidLoad(): void {
    setAttributeIfEmpty(this.element, 'role', 'button');
    this.km.addElement(this.element);
    this.km.attachClickBehavior('element', { space: true });
  }

  // an item moved in the page is disconnected and connected again, without loading again
  connectedCallback(): void {
    this.km.attachClickBehavior('element', { space: true });
  }

  disconnectedCallback(): void {
    this.km.detachClickBehavior();
  }

  // the selected item stays selected: a click on it selects nothing new, so it emits nothing
  private select = () => {
    if (this.selected) return;
    this.selected = true;
    this.selectedEvent.emit(this.element.id);
  };

  /**
   * Emits when the component is selected
   */
  @Event({ eventName: 'mdsTabBarItemSelect' }) selectedEvent: EventEmitter<string>;

  @Watch('label')
  labelChanged(newValue?: string): void {
    this.label = sanitizeLabel(newValue);
  }

  private onSlotChangeHandler = (): void => {
    /* this should be removed in the future once slotted text is no longer used, use the label property instead */
    if ((this.label ?? '') !== '') return;
    this.label = readSlottedLabel(this.element);
  };

  render() {
    return (
      <Host
        aria-current={this.selected ? 'true' : undefined}
        onClick={this.select}
        tabindex="0"
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <mds-icon name={this.icon} />
        <mds-text typography={this.typography}>
          {this.label || <slot onSlotchange={this.onSlotChangeHandler} />}
        </mds-text>
      </Host>
    );
  }
}
