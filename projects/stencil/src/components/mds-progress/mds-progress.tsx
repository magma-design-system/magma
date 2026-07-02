import { Component, Element, Host, h, Prop, Watch, State } from '@stencil/core';
import { DirectionType } from './meta/types';
import { ThemeVariantType } from '@type/variant';
import { removeAttributesIf, ifAttribute } from '@common/aria';
import { subscribePreference } from '@common/preference';
import { TypographyTechnicalType } from '@type/typography';
import { ProgressBarSizeType } from '@type/progress';

/**
 * @part progress - Selects the `div` element that contains the progress bar
 * @part radial-progress - Selects the `mds-radial-progress` element that contains the radial progress bar
 */

@Component({
  tag: 'mds-progress',
  styleUrl: 'mds-progress.css',
  shadow: true,
})
export class MdsProgress {
  @Element() private element: HTMLMdsAccordionTimerElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;
  @State() currentStep: string;
  private stepsList = new Array<string>();

  /**
   * A value between 0 and 1 that rapresents the status progress
   */
  @Prop() readonly progress: number = 0;

  /**
   * Specifies the direction of the progress bar, if horizonatl or vertical
   */
  @Prop({ reflect: true }) readonly direction?: DirectionType = 'horizontal';

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'primary';

  /**
   * The typography of the component
   */
  @Prop() readonly typography?: TypographyTechnicalType = 'option';

  /**
   * Sets the size of the component
   */
  @Prop({ reflect: true }) readonly size?: ProgressBarSizeType = 'sm';

  /**
   * Sets the steps that can be pronounced by accessibility technologies
   */
  @Prop() readonly steps: string = 'Inizio,Un quarto,Metà,Tre quarti,Fine';

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

  componentWillLoad(): void {
    this.stepsList = this.steps.split(',');
    this.setProgress(this.progress);
  }

  componentDidLoad(): void {
    removeAttributesIf(this.element, 'aria-hidden', 'true', [
      'aria-valuemax',
      'aria-valuemin',
      'aria-valuenow',
      'aria-valuetext',
      'role',
    ]);
  }

  private setProgress(progress: number): void {
    if (this.steps !== '') {
      this.currentStep = this.stepsList[Math.round(progress * (this.stepsList.length - 1))];
      if (!ifAttribute(this.element, 'aria-hidden')) {
        this.element.setAttribute('aria-valuetext', this.currentStep);
      }
    }
  }

  @Watch('progress')
  progressChanged(progress: number): void {
    this.setProgress(progress);
  }

  @Watch('steps')
  stepsChanged(steps: string): void {
    this.stepsList = steps.split(',');
  }

  render() {
    return (
      <Host
        aria-valuemax="100"
        aria-valuemin="0"
        aria-valuenow={!ifAttribute(this.element, 'aria-hidden') && Math.round(this.progress * 100)}
        role="progressbar"
        pref-animation={this.prefAnimation}
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        {this.direction === 'radial' ? (
          <mds-radial-progress
            progress={this.progress}
            part="radial-progress"
            typography={this.typography}
            variant={this.variant}
          ></mds-radial-progress>
        ) : (
          <div
            class="progress"
            part="progress"
            style={
              this.direction === 'horizontal'
                ? { flexGrow: `${this.progress}` }
                : { flexGrow: `${this.progress}`, width: '100%' }
            }
          ></div>
        )}
      </Host>
    );
  }
}
