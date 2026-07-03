import { Component, Host, State, h } from '@stencil/core';
import { subscribePreference } from '@common/preference';

@Component({
  tag: 'mds-hr',
  styleUrl: 'mds-hr.css',
  shadow: true,
})
export class MdsHr {
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;

  connectedCallback(): void {
    this.unsubscribePrefTheme = subscribePreference('theme', (value) => {
      this.prefTheme = value;
    });
    this.unsubscribePrefThemeScheme = subscribePreference('theme-scheme', (value) => {
      this.prefThemeScheme = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefTheme?.();
    this.unsubscribePrefThemeScheme?.();
  }

  render() {
    return <Host pref-theme={this.prefTheme} pref-theme-scheme={this.prefThemeScheme} />;
  }
}
