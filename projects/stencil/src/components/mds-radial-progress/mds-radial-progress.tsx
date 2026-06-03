import { Component, Host, h, Prop, State, Watch } from '@stencil/core';
import { TypographyTechnicalType, TypographyType } from '@type/typography';
import { ThemeVariantType } from '@type/variant';

/**
 * @part value-container - Selects the value container of the radial progress.
 * @part icon - Selects the icon of the radial progress.
 */

@Component({
  tag: 'mds-radial-progress',
  styleUrl: 'mds-radial-progress.css',
  shadow: true,
})
export class MdsRadialProgress {
  /**
   * A value between 0 and 1 that rapresents the status progress
   */
  @Prop() readonly progress: number = 0;

  @State() private animatedProgress: number = 0;

  private rafId: number | null = null;

  /**
   * Specifies if the component should display an icon
   */
  @Prop({ reflect: true }) readonly icon?: string | undefined;

  /**
   * The typography of the component
   */
  @Prop({ reflect: true }) readonly typography?: TypographyTechnicalType = 'option';

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'primary';

  /**
   * Returns the displayed progress percentage
   * @returns {string} The progress percentage
   */
  private progressPercentage = (value: number): string => `${Math.round(value * 100)}`;

  private clampProgress = (value: number): number => Math.min(1, Math.max(0, value));

  private prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

  private easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  private stopAnimation = () => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  private animateTo = (toRaw: number) => {
    const to = this.clampProgress(toRaw);
    const from = this.animatedProgress;

    this.stopAnimation();

    if (this.prefersReducedMotion()) {
      this.animatedProgress = to;
      return;
    }

    const durationMs = 500;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = this.easeOutExpo(t);
      this.animatedProgress = from + (to - from) * eased;

      if (t < 1) this.rafId = requestAnimationFrame(tick);
      else this.rafId = null;
    };

    this.rafId = requestAnimationFrame(tick);
  };

  componentWillLoad() {
    this.animatedProgress = this.clampProgress(this.progress);
  }

  disconnectedCallback() {
    this.stopAnimation();
  }

  @Watch('progress')
  onProgressChange(nextValue: number) {
    this.animateTo(nextValue);
  }

  render() {
    const progressVar = `${(this.animatedProgress * 100).toFixed(2)}%`;
    const progressText = this.progressPercentage(this.clampProgress(this.progress));
    return (
      <Host style={{ '--mds-radial-progress': progressVar }} role="progressbar">
        <div class="value-container" part="value-container">
          {this.icon && <mds-icon class="icon" name={this.icon} part="icon" />}
          <div class="value-container__text">
            <mds-text class="value" typography={this.typography as TypographyType}>
              {progressText}
            </mds-text>
          </div>
        </div>
      </Host>
    );
  }
}
