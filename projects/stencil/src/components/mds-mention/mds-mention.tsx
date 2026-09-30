import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core';
import miBaselineAlternateEmail from '@icon/mi/baseline/alternate-email.svg';
import miBaselineCancel from '@icon/mi/baseline/cancel.svg';
import { MdsMentionEvent } from './meta/interface';
import { MentionSize } from './meta/type';
import { TypographyType } from '@type/typography';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

@Component({
  tag: 'mds-mention',
  styleUrl: 'mds-mention.css',
  shadow: true,
})
export class MdsMention {
  @Element() private host: HTMLMdsMentionElement;

  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop({ reflect: true }) readonly deletable?: boolean;

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

  /**
   * Emits when the component's delete button is clicked
   */
  @Event({ eventName: 'mdsMentionDelete' }) deleteEvent: EventEmitter<MdsMentionEvent>;

  private sizeTypography = {
    sm: 'caption',
    md: 'detail',
    lg: 'h6',
  };

  private onDeleteHandler = (event: Event): void => {
    event.stopPropagation();
    this.deleteEvent.emit({ event, element: this.host });
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
        {this.deletable && (
          <mds-button
            class="action-remove"
            icon={miBaselineCancel}
            onClick={this.onDeleteHandler}
            size="sm"
            title={`${this.t.get('remove')} ${this.label ?? ''}`.trim()}
            tone="text"
            variant="dark"
          ></mds-button>
        )}
      </Host>
    );
  }
}
