import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';
import { subscribePreference } from '@common/preference';
import { ButtonIconPositionType, ButtonSizeType, ButtonType } from '@type/button';
import { MdsTabItemEventDetail } from './meta/event-detail';
import clsx from 'clsx';

@Component({
  tag: 'mds-tab-item',
  styleUrl: 'mds-tab-item.css',
  shadow: true,
})
export class MdsTabItem {
  @Element() private element: HTMLMdsTabItemElement;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;
  @State() isSelected?: boolean;
  @State() hasText: boolean;

  /**
   * Specifies if the button is awaiting for a response
   */
  @Prop({ reflect: true }) readonly await: boolean;

  /**
   * Specifies if the tab item is selected or not
   */
  @Prop({ reflect: true, mutable: true }) selected?: boolean;

  /**
   * Specifies if the tab item is disabled or not
   */
  @Prop({ reflect: true, mutable: true }) disabled?: boolean;

  /**
   * The icon displayed in the tab item
   */
  @Prop() readonly icon?: string;

  /**
   * The label of the tab item
   */
  @Prop({ reflect: true }) readonly label?: string;

  /**
   * Specifies the horizontal position of the icon displayed in the tab item
   */
  @Prop() readonly iconPosition?: ButtonIconPositionType = 'left';

  /**
   * The type of the tab item element
   */
  @Prop() readonly type?: ButtonType = 'submit';

  /**
   * Specifies the size for the tab item
   */
  @Prop({ reflect: true }) readonly size?: ButtonSizeType = 'md';

  /**
   * Specifies an optional value to get from mdsTabItemSelect event
   */
  @Prop({ reflect: true }) readonly value?: string;

  /**
   * Specifies the URL target of the button
   */
  @Prop({ reflect: true }) readonly href?: string;

  /**
   * Emits when the tab item is selected
   */
  @Event({ eventName: 'mdsTabItemSelect' }) selectedEvent: EventEmitter<MdsTabItemEventDetail>;

  /**
   * Emits when the tab item is selected
   */
  @Event({ eventName: 'mdsTabItemFocus' }) focusedEvent: EventEmitter<MdsTabItemEventDetail>;

  private toggle = (): void => {
    if (this.disabled) {
      return;
    }
    this.isSelected = !this.isSelected;
    if (this.isSelected) {
      this.selectedEvent.emit({ target: this.element, value: this.value });
    }
  };

  private focus = () => {
    this.focusedEvent.emit({ target: this.element, value: this.value });
  };

  @Watch('selected')
  validateActive(newValue?: boolean): void {
    this.isSelected = newValue;
    if (this.isSelected) {
      this.selectedEvent.emit({ target: this.element, value: this.value });
    }
  }

  connectedCallback(): void {
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
    this.unsubscribePrefContrast?.();
    this.unsubscribePrefTheme?.();
    this.unsubscribePrefThemeScheme?.();
  }

  componentWillLoad(): void {
    this.hasText = this.element.innerHTML !== '';
  }

  render() {
    return (
      <Host
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        <mds-button
          class={clsx('button', this.selected ? 'selected' : '')}
          await={this.await}
          disabled={this.disabled ?? undefined}
          href={this.href}
          icon={this.icon}
          iconPosition={this.iconPosition}
          onKeyDown={this.focus}
          onClick={this.toggle}
          part="button"
          role="tab"
          label={this.label}
          size={this.size}
          type={this.type}
        ></mds-button>
      </Host>
    );
  }
}
