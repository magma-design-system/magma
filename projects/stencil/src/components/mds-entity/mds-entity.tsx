import { Component, Element, Host, h, Prop } from '@stencil/core'
import { ThemeFullVariantAvatarType, ToneMinimalVariantType } from '@type/variant'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 */

@Component({
  tag: 'mds-entity',
  styleUrl: 'mds-entity.css',
  shadow: true,
})
export class MdsEntity {

  @Element() private hostElement: HTMLMdsEntityElement
  private details: boolean
  private actions: boolean

  /**
   * Specifies if the component is awaiting a response from an external resource
   */
  @Prop({ reflect: true }) readonly await?: boolean

  /**
   * Specifies the icon to be displayed if src propery is not used
   */
  @Prop({ reflect: true }) readonly icon?: string

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string

  /**
   * The user's inizials displayed if there's no image available and icon is not set
   */
  @Prop({ reflect: true }) readonly initials?: string

  /**
   * Specifies the color tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType

  /**
   * Specifies the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeFullVariantAvatarType

  private checkAvatar (): boolean {
    let hasAvatar = false
    if (this.src !== undefined) {
      hasAvatar = true
    }
    if (this.icon !== undefined) {
      hasAvatar = true
    }
    if (this.initials !== undefined) {
      hasAvatar = true
    }
    if (this.await) {
      return false
    }
    return hasAvatar
  }
  componentWillLoad (): void {
    this.details = this.hostElement.querySelector('[slot="detail"]') !== null
    this.actions = this.hostElement.querySelector('[slot="action"]') !== null
  }

  render () {
    return (
      <Host>
        <div class="spinner">
          <mds-spinner running></mds-spinner>
        </div>
        { this.checkAvatar() &&
          <mds-avatar class="preview" icon={this.icon} initials={this.initials} src={this.src} tone={this.tone} variant={this.variant}/>
        }
        <div class="infos">
          <slot/>
          { this.details &&
            <div class="details">
              <slot name="detail"/>
            </div>
          }
        </div>
        { this.actions &&
          <div class="actions">
            <slot name="action"/>
          </div>
        }
      </Host>
    )
  }

}
