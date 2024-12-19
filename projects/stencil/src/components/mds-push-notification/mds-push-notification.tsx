import dayjs from 'dayjs'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Component, Element, Event, EventEmitter, Host, h, Prop, Method, State } from '@stencil/core'
import { ISO8601Date } from '@type/date'
import { Locale } from '@common/locale'
import { MdsPushNotificationEventDetail } from './meta/event-detail'
import { NotificationPreviewType, NotificationDateFormatType, RelativeTimeType } from './meta/types'
import { ThemeFullVariantAvatarType, ToneMinimalVariantType } from '@type/variant'
import { sanitizeISO8601Date } from '@common/date'

dayjs.extend(relativeTime)

/**
 * @part actions - The actions wrapper
 * @part content - The content wrapper of the message
 * @part icon - The icon set by `icon` attribute
 * @part picture - The picture image added by `src` attribute
 * @slot actions - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot badge - Add `HTML elements` or `components`, it is **recommended** to use `mds-badge` element.
 */

@Component({
  tag: 'mds-push-notification',
  styleUrl: 'mds-push-notification.css',
  shadow: true,
})
export class MdsPushNotification {

  private hasActions?: boolean
  private hasBadge?: boolean
  @Element() host: HTMLMdsPushNotificationElement
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  /**
   * Specifies the notification date based on [standard ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html).
   */
  @Prop({ reflect: true, mutable: true }) datetime?: string

  /**
   * Specifies if the notification date format shows time passed or displays date as a static string
   */
  @Prop({ reflect: true }) readonly dateFormat: NotificationDateFormatType = 'timeago'

  /**
   * Specifies if the component is dismissable or not, it should be set to true by default is used with it's parent component `mds-push-notifications`
   */
  @Prop({ reflect: true }) readonly deletable: boolean = true

  /**
   * Specifies the icon to be displayed
   */
  @Prop({ reflect: true }) readonly icon?: string

  /**
   * The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others
   */
  @Prop({ mutable:true, reflect: true }) readonly initials?: string

  /**
   * Specifies the message of the component
   */
  @Prop({ reflect: true }) readonly message: string = 'Nessun messaggio disponibile'

  /**
   * Specifies if the `src` attribute is used to show a the image as avatar or full image
   */
  @Prop({ reflect: true }) readonly preview?: NotificationPreviewType = 'image'

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string

  /**
   * Specifies the subject of the component
   */
  @Prop({ reflect: true }) readonly subject?: string

  /**
   * Specifies the color tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'weak'

  /**
   * Specifies the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeFullVariantAvatarType

  /**
   * Emits when the component is closed
   */
  @Event({ eventName: 'mdsPushNotificationClose' }) closedEvent: EventEmitter<MdsPushNotificationEventDetail>

  private onClickClose = (e: Event) => {
    e.stopPropagation()
    this.closedEvent.emit()
  }

  componentWillLoad ():void {
    this.hasActions = this.host.querySelector('[slot="actions"]') !== null
    this.hasBadge = this.host.querySelector('[slot="badge"]') !== null

    if (this.datetime) {
      this.datetime = sanitizeISO8601Date(this.datetime?.toString()) as ISO8601Date
    }

    this.t.lang(this.host)
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
    }

    dayjs.locale('custom-locale', { relativeTime: relativeTimeCustom as RelativeTimeType })
  }

  render () {
    return (
      <Host>
        { (this.icon ?? this.preview === 'avatar') && <mds-avatar class="avatar" icon={this.icon} initials={this.initials} part="avatar" src={this.src} tone={this.tone} variant={this.variant}></mds-avatar> }
        { this.src && this.preview !== 'avatar' && <mds-img class="picture" part="picture" src={this.src}></mds-img> }
        <div class="content" part="content">
          <div class="header">
            <div class="infos">
              { this.hasBadge && <div><slot name="badge"></slot></div> }
              { this.subject && <mds-text class="subject" typography="h6" variant="title" truncate="all">{ this.subject }</mds-text> }
            </div>
            { this.datetime && <mds-text class="time" typography="option">
              { this.dateFormat === 'timeago'
                ? dayjs(this.datetime).fromNow()
                : dayjs(this.datetime).format(this.dateFormat)
              }
            </mds-text> }
          </div>
          <mds-text class="message" truncate="all" typography="caption" variant="info">{ this.message }</mds-text>
          { this.hasActions && <div class="actions" part="actions">
            <slot name="actions"></slot>
          </div> }
        </div>
        { this.deletable && <mds-button class="close-button" title={this.t.get('dismiss')} icon={miBaselineCancel} onClick={this.onClickClose.bind(this)}></mds-button> }
      </Host>
    )
  }
}
