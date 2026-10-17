import { Component, Host, Prop, h, Element } from '@stencil/core';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 */
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

  componentWillLoad(): void {
    // the slot of mds-input-date-range unless the author gave another one, as the `preselection`
    // slot of mds-calendar: set on the host at every render, it overwrote the author's
    if (!this.host.hasAttribute('slot')) {
      this.host.setAttribute('slot', 'calendar-preselection');
    }
  }

  private onClick = (event: MouseEvent) => {
    const mdsInputDateRange = this.host?.closest('mds-input-date-range');
    // outside a date range the click is the page's to handle, so it goes on
    if (!mdsInputDateRange) return;
    event.stopPropagation();
    mdsInputDateRange.preselect({ caller: this.host, start: this.start, end: this.end });
    this.selected = true;
  };

  render() {
    return (
      <Host>
        <mds-button onClick={this.onClick} class="action" variant="primary" tone="strong">
          <slot></slot>
        </mds-button>
      </Host>
    );
  }
}
