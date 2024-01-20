import { Component, Element, Host, h, Prop } from '@stencil/core'
import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import { ThemeFullVariantAvatarType, ToneMinimalVariantType } from '@type/variant'
import { NotificationPreviewType } from './meta/types'

/**
 * @part actions - The actions wrapper
 * @part content - The content wrapper of the message
 * @part icon - The icon set by `icon` attribute
 * @part picture - The picture image added by `src` attribute
 * @slot actions - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 */

@Component({
  tag: 'mds-push-notification',
  styleUrl: 'mds-push-notification.css',
  shadow: true,
})
export class MdsPushNotification {

  private hasActions?: boolean
  @Element() host: HTMLMdsPushNotificationElement

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

  componentWillLoad ():void {
    this.hasActions = this.host.querySelector('[slot="actions"]') !== null
  }

  render () {
    return (
      <Host>
        { (this.icon ?? this.preview === 'avatar') && <mds-avatar class="avatar" icon={this.icon} initials={this.initials} part="avatar" src={this.src} tone={this.tone} variant={this.variant}></mds-avatar> }
        { this.src && this.preview !== 'avatar' && <mds-img class="picture" part="picture" src={this.src}></mds-img> }
        <div class="content" part="content">
          { this.subject && <mds-text class="subject" typography="h6" variant="title">{ this.subject }</mds-text> }
          <mds-text class="message" truncate="all" typography="caption" variant="info">{ this.message }</mds-text>
          { this.hasActions && <div class="actions" part="actions">
            <slot name="actions"></slot>
          </div> }
        </div>
        <mds-button class="close-button" icon={miBaselineCancel}></mds-button>
      </Host>
    )
  }
}
