import { Component, Host, Element, h, Prop, Watch } from '@stencil/core';
import { ThemeVariantType } from '@type/variant';
import { BenchmarkBarTypographyType } from './meta/types';
import { ProgressBarSizeType } from '@type/progress';
import { readSlottedLabel, sanitizeLabel } from '@common/slot';

/**
 * @slot - **Deprecated**, use the `label` property instead. Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 * @part progress-bar - The progress bar element
 */

@Component({
  tag: 'mds-benchmark-bar',
  styleUrl: 'mds-benchmark-bar.css',
  shadow: true,
})
export class MdsBenchmarkBar {
  @Element() host: HTMLMdsBenchmarkBarElement;

  /**
   * The label of the benchmark bar
   */
  @Prop({ reflect: true, mutable: true }) label?: string;

  /**
   * An alias to custom how value is represented
   */
  @Prop() readonly alias?: string;

  /**
   * The typography of the component
   */
  @Prop() readonly typography?: BenchmarkBarTypographyType = 'label';

  /**
   * A value between 0 and 100 that rapresents the benchmark
   */
  @Prop() readonly value: number = 0;

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'dark';

  /**
   * Sets the size of the component
   */
  @Prop({ reflect: true }) readonly size?: ProgressBarSizeType = 'md';

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
      <Host>
        <div class="infos">
          <mds-text typography={this.typography} class="label" id="label" truncate="word">
            {this.label || <slot onSlotchange={this.onSlotChangeHandler} />}
          </mds-text>
          <mds-text typography={this.typography} class="value" truncate="word">
            {this.alias ?? this.value}
          </mds-text>
        </div>
        <mds-progress
          aria-labelledby="label"
          aria-valuetext={this.alias}
          class="progress"
          variant={this.variant}
          progress={this.value / 100}
          size={this.size}
          part="progress-bar"
        />
      </Host>
    );
  }
}
