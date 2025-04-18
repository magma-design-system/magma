import { Component, Host, h, Prop } from '@stencil/core'
import { ThemeFullVariantAvatarType, ToneMinimalVariantType } from '@type/variant'

@Component({
  tag: 'mds-avatar-stack-item',
  styleUrl: 'mds-avatar-stack-item.css',
  shadow: true,
})
export class MdsAvatarStackItem {

  /**
   * Specifies number of total avatars, the total number will be subtracted by the slotted ones
   */
  @Prop({ reflect: true }) readonly count?: number

  /**
   * The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others
   */
  @Prop({ mutable:true, reflect: true }) readonly initials?: string

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string

  /**
   * Specifies the color tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'weak'

  /**
   * Specifies the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeFullVariantAvatarType

  render () {
    return (
      <Host>
        <mds-avatar class="avatar" count={this.count} initials={this.initials} src={this.src} tone={this.tone} variant={this.variant}></mds-avatar>
      </Host>
    )
  }
}
