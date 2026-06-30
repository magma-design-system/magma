import { Component, Element, Host, h, Prop, State } from '@stencil/core';
import { ThemeFullVariantAvatarType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot detail - Add `HTML elements` or `components` to this slot.
 * @part spinner - The spinner element
 * @part avatar - The avatar element
 */

@Component({
  tag: 'mds-entity',
  styleUrl: 'mds-entity.css',
  shadow: true,
})
export class MdsEntity {
  @Element() private hostElement: HTMLMdsEntityElement;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;
  private details: boolean;
  private actions: boolean;

  /**
   * Specifies if the component is awaiting a response from an external resource
   */
  @Prop({ reflect: true }) readonly await?: boolean;

  /**
   * Specifies the icon to be displayed if src propery is not used
   */
  @Prop({ reflect: true }) readonly icon?: string;

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string;

  /**
   * The user's inizials displayed if there's no image available and icon is not set
   */
  @Prop({ reflect: true }) readonly initials?: string;

  /**
   * Specifies the color tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType;

  /**
   * Specifies the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeFullVariantAvatarType;

  private checkAvatar(): boolean {
    let hasAvatar = false;
    if (this.src !== undefined) {
      hasAvatar = true;
    }
    if (this.icon !== undefined) {
      hasAvatar = true;
    }
    if (this.initials !== undefined) {
      hasAvatar = true;
    }
    if (this.await) {
      return false;
    }
    return hasAvatar;
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
    this.details = this.hostElement.querySelector(':scope > [slot="detail"]') !== null;
    this.actions = this.hostElement.querySelector(':scope > [slot="action"]') !== null;
  }

  render() {
    return (
      <Host
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        <div class="spinner" part="spinner">
          <mds-spinner running></mds-spinner>
        </div>
        {this.checkAvatar() && (
          <mds-avatar
            class="preview"
            icon={this.icon}
            initials={this.initials}
            src={this.src}
            tone={this.tone}
            variant={this.variant}
            part="avatar"
          />
        )}
        <div class="infos">
          <slot />
          {this.details && (
            <div class="details">
              <slot name="detail" />
            </div>
          )}
        </div>
        {this.actions && (
          <div class="actions">
            <slot name="action" />
          </div>
        )}
      </Host>
    );
  }
}
