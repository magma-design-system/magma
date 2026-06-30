import { Component, Host, Element, h, Prop, State, Watch } from '@stencil/core';
import { TypographyLabelType } from '@type/typography';
import { ThemeFullVariantType } from '@type/variant';
import { ToneSmartVariantType } from '@type/tone';
import { readSlottedLabel, sanitizeLabel } from '@common/slot';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - **Deprecated**, use the `label` property instead. Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-badge',
  styleUrl: 'mds-badge.css',
  shadow: true,
})
export class MdsBadge {
  @Element() host: HTMLMdsBadgeElement;
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
   * The label of the badge
   */
  @Prop({ reflect: true, mutable: true }) label?: string;

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) variant?: ThemeFullVariantType = 'green';

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) tone?: ToneSmartVariantType = 'weak';

  /**
   * Specifies the typography of the element
   */
  @Prop({ reflect: true }) readonly typography: TypographyLabelType = 'option';

  @Watch('label')
  labelChanged(newValue?: string): void {
    this.label = sanitizeLabel(newValue);
  }

  private onSlotChangeHandler = (): void => {
    /* this should be removed in the future once slotted text is no longer used, use the label property instead */
    if (this.label) return;
    this.label = readSlottedLabel(this.host);
  };

  render() {
    return (
      <Host
        pref-animation={this.prefAnimation}
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        <mds-text tag="span" typography={this.typography} variant="info" text={this.label}>
          {this.label || <slot onSlotchange={this.onSlotChangeHandler} />}
        </mds-text>
      </Host>
    );
  }
}
