import { Component, Host, h, Prop } from '@stencil/core';
import miBaselineAlternateEmail from '@icon/mi/baseline/alternate-email.svg';
import miBaselineCancel from '@icon/mi/baseline/cancel.svg';
import { MentionSize } from './meta/type';
import { TypographyType } from '@type/typography';

@Component({
  tag: 'mds-mention',
  styleUrl: 'mds-mention.css',
  shadow: true,
})
export class MdsMention {
  /**
   * Sets the icon shown at the left of the label
   */
  @Prop({ reflect: true }) readonly icon?: string;

  /**
   * Sets the label of the component
   */
  @Prop({ reflect: true }) readonly label?: string;

  /**
   * Sets the label of the component
   */
  @Prop({ reflect: true }) readonly size?: MentionSize = 'sm';

  private sizeTypography = {
    sm: 'caption',
    md: 'detail',
    lg: 'h6',
  };

  render() {
    return (
      <Host>
        <mds-icon
          name={this.icon !== undefined && this.icon !== '' ? this.icon : miBaselineAlternateEmail}
        ></mds-icon>
        <mds-text typography={this.sizeTypography[this.size ?? 'md'] as TypographyType}>
          {this.size === 'lg' ? this.label : <b>{this.label}</b>}
        </mds-text>
        <mds-button
          class="action-remove"
          title="Remove"
          variant="dark"
          tone="text"
          size="sm"
          icon={miBaselineCancel}
        ></mds-button>
      </Host>
    );
  }
}
