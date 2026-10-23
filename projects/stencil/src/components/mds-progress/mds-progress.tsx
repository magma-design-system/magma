import { Component, Element, Host, h, Prop, Watch, State } from '@stencil/core';
import { DirectionType } from './meta/types';
import { ThemeVariantType } from '@type/variant';
import { preferenceStore } from '@common/preference';
import { TypographyTechnicalType } from '@type/typography';
import { ProgressBarSizeType } from '@type/progress';

/**
 * @part progress - Selects the `div` element that contains the progress bar
 * @part radial-progress - Selects the `mds-radial-progress` element that contains the radial progress bar
 * @category feedback
 */

@Component({
  tag: 'mds-progress',
  styleUrl: 'mds-progress.css',
  shadow: true,
})
export class MdsProgress {
  @Element() private element: HTMLMdsProgressElement;
  @State() private leftOut = false;
  private stepsList = new Array<string>();
  private appliedValueText?: string;

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

  componentWillLoad(): void {
    this.stepsList = this.steps.split(',');
    this.leftOut = this.element.getAttribute('aria-hidden') === 'true';
  }

  @Watch('steps')
  stepsChanged(steps: string): void {
    this.stepsList = steps.split(',');
  }

  /**
   * A progress hidden from assistive technologies is no progressbar: role and values leave with
   * `aria-hidden`, and come back when it is removed. It used to be read once, at load.
   */
  // Stencil watches a native attribute too (it joins observedAttributes), the lint rule predates it
  // eslint-disable-next-line stencil/no-unused-watch
  @Watch('aria-hidden')
  ariaHiddenChanged(): void {
    this.leftOut = this.element.getAttribute('aria-hidden') === 'true';
  }

  // a value outside 0..1 reads as its nearest end: above 1 it named a step past the last one
  // ("undefined") and a percentage above 100
  private clampedProgress = (): number => {
    const progress = Number(this.progress);
    if (Number.isNaN(progress)) return 0;
    return Math.min(1, Math.max(0, progress));
  };

  /**
   * The step the progress has reached, as the spoken value. An aria-valuetext written on the
   * host by the author (mds-benchmark-bar writes its alias) is the more specific one and stays;
   * the one this progress wrote before is its own to update.
   */
  private resolveValueText = (): string | undefined => {
    const step =
      this.steps !== ''
        ? this.stepsList[Math.round(this.clampedProgress() * (this.stepsList.length - 1))]
        : undefined;
    const current = this.element.getAttribute('aria-valuetext');
    if (current !== null && current !== this.appliedValueText && current !== step) {
      return current;
    }
    this.appliedValueText = step;
    return step;
  };

  render() {
    return (
      <Host
        aria-valuemax={this.leftOut ? undefined : '100'}
        aria-valuemin={this.leftOut ? undefined : '0'}
        aria-valuenow={this.leftOut ? undefined : Math.round(this.clampedProgress() * 100)}
        aria-valuetext={this.leftOut ? undefined : this.resolveValueText()}
        role={this.leftOut ? undefined : 'progressbar'}
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {this.direction === 'radial' ? (
          <mds-radial-progress
            // the host already is the progressbar: a second, nameless one would be announced too
            aria-hidden="true"
            progress={this.clampedProgress()}
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
                ? { flexGrow: `${this.clampedProgress()}` }
                : { flexGrow: `${this.clampedProgress()}`, width: '100%' }
            }
          ></div>
        )}
      </Host>
    );
  }
}
