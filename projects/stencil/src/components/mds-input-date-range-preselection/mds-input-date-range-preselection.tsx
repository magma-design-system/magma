import { Component, Host, Prop, h, Element } from '@stencil/core';

@Component({
  tag: 'mds-input-date-range-preselection',
  styleUrl: 'mds-input-date-range-preselection.css',
  shadow: true,
})
export class MdsInputDateRangePreselection {
  @Element() host: HTMLMdsInputDateRangePreselectionElement;

  /**
   * Sets the preselection date range
   */
  @Prop({ reflect: true, mutable: true }) selected?: boolean;

  /**
   * Sets the start date of the preselection
   */
  @Prop({ reflect: true }) readonly start!: string;

  /**
   * Sets the end date of the preselection
   */
  @Prop({ reflect: true }) readonly end?: string;

  private onClick = (event: MouseEvent) => {
    event.stopPropagation();
    const mdsInputDateRange = this.host?.closest('mds-input-date-range');
    if (mdsInputDateRange) {
      mdsInputDateRange.preselect({ caller: this.host, start: this.start, end: this.end });
      this.selected = true;
    }
  };

  render() {
    return (
      <Host slot="calendar-preselection">
        <mds-button onClick={this.onClick} class="action" variant="primary" tone="strong">
          <slot></slot>
        </mds-button>
      </Host>
    );
  }
}
