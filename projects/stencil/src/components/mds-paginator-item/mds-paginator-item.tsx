import { Component, Host, h, Prop, Element, State } from '@stencil/core';
import { KeyboardManager } from '@common/keyboard-manager';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-paginator-item',
  styleUrl: 'mds-paginator-item.css',
  shadow: true,
})
export class MdsPaginatorItem {
  @Element() host: HTMLMdsPaginatorItemElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;
  private km = new KeyboardManager();

  /**
   * Specifies the icon used inside the paginator item
   */
  @Prop({ reflect: true }) readonly icon?: string;

  /**
   * Specifies if the item is selected or not, is handled from the parent paginator
   */
  @Prop({ reflect: true }) readonly selected?: boolean;

  /**
   * Specifies if the item is disabled or not, is handled from the parent paginator
   */
  @Prop({ reflect: true }) readonly disabled?: boolean;

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
    this.unsubscribePrefTheme = subscribePreference('theme', (value) => {
      this.prefTheme = value;
    });
    this.unsubscribePrefThemeScheme = subscribePreference('theme-scheme', (value) => {
      this.prefThemeScheme = value;
    });
  }

  componentDidLoad(): void {
    this.km.addElement(this.host);
    this.km.attachClickBehavior();
  }

  componentDidUpdate(): void {
    if (!this.disabled && !this.selected) {
      this.km.attachClickBehavior();
      return;
    }

    this.km.detachClickBehavior();
  }

  disconnectedCallback = (): void => {
    this.unsubscribePrefAnimation?.();
    this.unsubscribePrefTheme?.();
    this.unsubscribePrefThemeScheme?.();
    this.km.detachClickBehavior();
  };

  render() {
    return (
      <Host
        tabindex="0"
        pref-animation={this.prefAnimation}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        {this.icon !== undefined ? (
          <mds-icon class="icon" name={this.icon} />
        ) : (
          <mds-text class="text" typography="caption">
            <b>
              <slot />
            </b>
          </mds-text>
        )}
      </Host>
    );
  }
}
