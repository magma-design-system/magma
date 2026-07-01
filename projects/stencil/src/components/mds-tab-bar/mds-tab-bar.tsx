import { Component, Event, EventEmitter, Element, Host, h, Listen, State } from '@stencil/core';
import { MdsTabBarEventDetail } from './meta/event-detail';
import { subscribePreference } from '@common/preference';

/**
 * @slot - Add `mds-tab-bar-item` element/s.
 */

@Component({
  tag: 'mds-tab-bar',
  styleUrl: 'mds-tab-bar.css',
  shadow: true,
})
export class MdsTabBar {
  @Element() private element: HTMLMdsTabBarElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;

  /**
   * Emits when a step is changed
   */
  @Event({ eventName: 'mdsTabBarChange' }) changedEvent: EventEmitter<MdsTabBarEventDetail>;

  private queryItems = (): NodeListOf<HTMLMdsTabBarItemElement> =>
    this.element.querySelectorAll<HTMLMdsTabBarItemElement>('mds-tab-bar-item');

  componentWillLoad(): void {
    const items = this.queryItems();
    items.forEach((item, key) => (item.id = `mds-tab-bar-item-${key}`));
  }

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

  @Listen('mdsTabBarItemSelect')
  changeEventHandler(event: CustomEvent<string>): void {
    const items = this.queryItems();
    items.forEach((item, key) => {
      item.selected = `mds-tab-bar-item-${key}` === event.detail;
      if (item.selected) {
        this.changedEvent.emit({ index: key });
      }
    });
  }

  render() {
    return (
      <Host
        pref-animation={this.prefAnimation}
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        <slot />
      </Host>
    );
  }
}
