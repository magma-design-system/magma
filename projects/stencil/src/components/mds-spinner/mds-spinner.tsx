import { Component, Host, h, Prop, State, Watch } from '@stencil/core';
import { subscribePreference } from '@common/preference';
import awaitIcon from './assets/await-rounded.svg';

@Component({
  tag: 'mds-spinner',
  styleUrl: 'mds-spinner.css',
  shadow: true,
})
export class MdsSpinner {
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;

  connectedCallback(): void {
    this.unsubscribePrefContrast = subscribePreference('contrast', (value) => {
      this.prefContrast = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefContrast?.();
  }

  /**
   * Specifies if the animation is running or not, it's required for performance reasons
   */
  @Prop({ reflect: true, mutable: true }) running?: boolean = false;

  @Watch('running')
  handleRunning(newValue?: boolean): void {
    if (newValue === false) {
      this.running = undefined;
    }
  }

  render() {
    return (
      <Host pref-contrast={this.prefContrast}>
        <i class="await-icon" innerHTML={awaitIcon} />
      </Host>
    );
  }
}
