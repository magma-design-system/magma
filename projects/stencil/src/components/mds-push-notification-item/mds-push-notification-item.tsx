import dayjs from 'dayjs';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import miBaselineCancel from '@icon/mi/baseline/cancel.svg';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import clsx from 'clsx';
import { Locale } from '@common/locale';
import { MdsPushNotificationItemEventDetail } from './meta/event-detail';
import {
  NotificationItemPreviewType,
  NotificationItemDateFormatType,
  RelativeTimeType,
} from './meta/types';
import { ThemeFullVariantAvatarType } from '@type/variant';
import { ToneMinimalVariantType } from '@type/tone';

import { sanitizeISO8601Date } from '@common/date';
import { preferenceStore } from '@common/preference';

/**
 * @part actions - The actions wrapper
 * @part avatar - The `mds-avatar` that shows the `icon`, the `initials` or, with `preview` set to `avatar`, the picture of `src`
 * @part content - The content wrapper of the message
 * @part picture - The picture image added by `src` attribute
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot badge - Add `HTML elements` or `components`, it is **recommended** to use `mds-badge` element.
 * @parent mds-push-notification
 */

@Component({
  tag: 'mds-push-notification-item',
  styleUrl: 'mds-push-notification-item.css',
  shadow: true,
})
export class MdsPushNotificationItem {
  @Element() host: HTMLMdsPushNotificationItemElement;
  @State() hasActions: boolean;
  @State() hasBadge: boolean;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Specifies the notification date based on [standard ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html).
   * @example '2025-06-15T09:30:00+02:00'
   */
  @Prop({ reflect: true, mutable: true }) datetime?: string;

  /**
   * Specifies how the notification date is written: `timeago` shows the time passed, any other
   * value is the Day.js format of a static date
   * @example 'DD/MM/YYYY HH:mm'
   */
  @Prop({ reflect: true }) readonly dateFormat: NotificationItemDateFormatType = 'timeago';

  /**
   * Shows a dismiss button: activating it emits `mdsPushNotificationItemClose`, and a parent
   * `mds-push-notification` takes the item out of the stack
   */
  @Prop({ reflect: true, mutable: true }) dismissible?: boolean;

  /**
   * Shows the dismiss button, as `dismissible` does.
   * @deprecated Use `dismissible`: the button dismisses the notification, it deletes nothing.
   * Goes in the next major.
   */
  @Prop({ reflect: true, mutable: true }) deletable?: boolean = false;

  /**
   * Specifies the icon to be displayed
   */
  @Prop({ reflect: true }) readonly icon?: string;

  /**
   * The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others
   */
  @Prop({ mutable: true, reflect: true }) readonly initials?: string;

  /**
   * Specifies the message of the component
   */
  @Prop({ reflect: true }) readonly message: string = 'Nessun messaggio disponibile';

  /**
   * Specifies if the `src` attribute is used to show a the image as avatar or full image
   */
  @Prop({ reflect: true }) readonly preview?: NotificationItemPreviewType = 'image';

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string;

  /**
   * Specifies the subject of the component
   */
  @Prop({ reflect: true }) readonly subject?: string;

  /**
   * Specifies the color tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'weak';

  /**
   * Specifies the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeFullVariantAvatarType;

  /**
   * Emits when the component is closed
   */
  @Event({ eventName: 'mdsPushNotificationItemClose' })
  closedEvent: EventEmitter<MdsPushNotificationItemEventDetail>;

  private onClickClose = (e: Event) => {
    e.stopPropagation();
    // the detail the event declares: it was emitted empty
    this.closedEvent.emit({ id: this.host.id });
  };

  componentDidLoad(): void {
    this.handleDismissibleChange(this.dismissible);
    this.handleDeletableChange(this.deletable);
  }

  private isDismissible = (): boolean => this.dismissible === true || this.deletable === true;

  private onSlotChange = (): void => {
    this.hasActions = hasChildWithSlot(this.host, 'action');
    this.hasBadge = hasChildWithSlot(this.host, 'badge');
  };

  componentWillLoad(): void {
    dayjs.extend(relativeTime);
    this.onSlotChange();

    if (this.datetime !== undefined && this.datetime !== '') {
      this.datetime = sanitizeISO8601Date(this.datetime.toString()) ?? undefined;
    }

    const relativeTimeCustom = {
      future: this.t.get('future'),
      past: this.t.get('past'),
      s: this.t.get('s'),
      m: this.t.get('m'),
      mm: this.t.get('mm'),
      h: this.t.get('h'),
      hh: this.t.get('hh'),
      d: this.t.get('d'),
      dd: this.t.get('dd'),
      M: this.t.get('M'),
      MM: this.t.get('MM'),
      y: this.t.get('y'),
      yy: this.t.get('yy'),
    };

    dayjs.locale('custom-locale', { relativeTime: relativeTimeCustom as RelativeTimeType });
  }

  // a false boolean is an absent attribute: `dismissible="false"` leaves the host once loaded
  @Watch('dismissible')
  handleDismissibleChange(newValue?: boolean): void {
    if (newValue === false) {
      this.dismissible = undefined;
    }
  }

  @Watch('deletable')
  handleDeletableChange(newValue?: boolean): void {
    if (newValue === false) {
      this.deletable = undefined;
    }
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        {(this.icon ?? this.preview === 'avatar') && (
          <mds-avatar
            class="avatar"
            icon={this.icon}
            initials={this.initials}
            part="avatar"
            src={this.src}
            tone={this.tone}
            variant={this.variant}
          ></mds-avatar>
        )}
        {this.src && this.preview !== 'avatar' && (
          <mds-img class="picture" part="picture" src={this.src}></mds-img>
        )}
        <div class="content" part="content">
          <div class="header">
            <div class="infos">
              <div class={clsx('badge', !this.hasBadge && 'badge--hidden')}>
                <slot name="badge" onSlotchange={this.onSlotChange}></slot>
              </div>
              {this.subject && (
                <mds-text class="subject" typography="h6" variant="title" truncate="all">
                  {this.subject}
                </mds-text>
              )}
            </div>
            {this.datetime && (
              <mds-text class="time" typography="option">
                {this.dateFormat === 'timeago'
                  ? dayjs(this.datetime).fromNow()
                  : dayjs(this.datetime).format(this.dateFormat)}
              </mds-text>
            )}
          </div>
          <mds-text class="message" truncate="all" typography="caption" variant="info">
            {this.message}
          </mds-text>
          <div class={clsx('actions', !this.hasActions && 'actions--hidden')} part="actions">
            <slot name="action" onSlotchange={this.onSlotChange}></slot>
          </div>
        </div>
        {this.isDismissible() && (
          <mds-button
            class="close-button"
            variant="dark"
            tone="text"
            title={this.t.get('dismiss')}
            icon={miBaselineCancel}
            onClick={this.onClickClose}
          ></mds-button>
        )}
      </Host>
    );
  }
}
