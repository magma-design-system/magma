import { Component, Host, h, Prop } from '@stencil/core'
import miBaselineCancel from '@icon/mi/baseline/cancel.svg'

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

  /**
   * Specifies the icon to be displayed
   */
  @Prop({ reflect: true }) readonly icon?: string

  /**
   * Specifies the message of the component
   */
  @Prop({ reflect: true }) readonly message: string = 'Nessun messaggio disponibile'

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string

  /**
   * Specifies the subject of the component
   */
  @Prop({ reflect: true }) readonly subject?: string

  render () {
    return (
      <Host>
        { this.icon && <mds-icon class="icon" name={this.icon} part="icon"></mds-icon> }
        { !this.icon && this.src && <mds-img class="picture" part="picture"></mds-img> }
        <div class="content" part="content">
          { this.subject && <mds-text class="subject" typography="h6" variant="title">{ this.subject }</mds-text> }
          <mds-text class="message" typography="caption" variant="info">{ this.message }</mds-text>
          <div class="actions" part="actions">
            <slot name="actions"></slot>
          </div>
        </div>
        <mds-button class="close-button"><i class="svg close-icon" innerHTML={miBaselineCancel}/></mds-button>
      </Host>
    )
  }
}
