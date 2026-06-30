import { Component, Host, h, Prop, Element, Watch, Method, State } from '@stencil/core';
import { ModalOverflowType } from 'src/components';
import { StatusBarPositionType } from './meta/types';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @part actions - Selects the `actions` container element wrapped in shadowDOM.
 * @part status-bar - Selects the `status-bar` window component wrapped in shadowDOM.
 * @part status-bar-area - Selects the `status-bar-area` which wraps `status-bar` element with darker area in shadowDOM.
 */

@Component({
  tag: 'mds-status-bar',
  styleUrl: 'mds-status-bar.css',
  shadow: true,
})
export class MdsStatusBar {
  @Element() host: HTMLMdsStatusBarElement;
  private modal: HTMLMdsModalElement;
  @State() consumption?: string;
  private unsubscribeConsumption?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;

  /**
   * Specifies the description near the slotted actions
   */
  @Prop({ reflect: true }) readonly description?: string;

  /**
   * Specifies if the component prevents the body from scrolling when modal window is opened
   */
  @Prop({ reflect: true }) readonly overflow: ModalOverflowType = 'manual';

  /**
   * Specifies the position of the status bar
   */
  @Prop({ reflect: true }) readonly position: StatusBarPositionType = 'bottom-right';

  /**
   * Specifies if the component is visible
   */
  @Prop({ reflect: true, mutable: true }) visible?: boolean;

  connectedCallback(): void {
    this.unsubscribeConsumption = subscribePreference('consumption', (value) => {
      this.consumption = value;
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
    this.unsubscribeConsumption?.();
    this.unsubscribePrefContrast?.();
    this.unsubscribePrefTheme?.();
    this.unsubscribePrefThemeScheme?.();
  }

  componentDidLoad(): void {
    this.modal = this.host.shadowRoot?.querySelector('.modal') as HTMLMdsModalElement;
    this.modal.backdrop = undefined;
  }

  @Watch('visible')
  handleVisbilityProp(newValue?: boolean): void {
    if (newValue === false) {
      this.visible = undefined;
    }
  }

  @Method()
  async hide(): Promise<void> {
    this.visible = undefined;
  }

  render() {
    return (
      <Host
        pref-consumption={this.consumption}
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        <mds-modal
          class="modal"
          opened={this.visible}
          position={this.position}
          animation="custom"
          overflow={this.overflow}
        >
          <div class="status-bar-area" part="status-bar-area" slot="window">
            <div class="status-bar" part="status-bar">
              {this.description && (
                <mds-text typography="caption" class="description">
                  {this.description}
                </mds-text>
              )}
              <div class="actions" part="actions">
                <slot></slot>
              </div>
            </div>
          </div>
        </mds-modal>
      </Host>
    );
  }
}
