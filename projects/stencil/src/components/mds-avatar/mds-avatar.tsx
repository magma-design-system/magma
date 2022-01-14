import { Component, Host, h, State, Prop, Watch } from '@stencil/core'
import clsx from 'clsx'
import { avatarVariant } from './meta/variants'

@Component({
  tag: 'mds-avatar',
  styleUrl: 'mds-avatar.css',
  shadow: true,
})
export class MdsAvatar {

  @State() placeholder = false
  @State() loaded = false
  @State() hasInitials = false

  /**
   * Specifies the path to the image
   */
  @Prop() readonly src?: string

  /**
   * The user's inizials displayed if there's no image available
   */
  @Prop() readonly initials?: string

  private checkInitials = (value: string): void => {
    if (value !== undefined && value !== '') {
      this.hasInitials = true
      return
    }

    this.hasInitials = false
  }

  componentWillLoad (): void {
    this.checkInitials(this.initials)
  }

  @Watch('initials')
  initialsHandler (newValue: string): void {
    this.checkInitials(newValue)
  }

  render () {
    let backgroundColor = ''
    if (this.hasInitials) {
      let cleanedInitials = this.initials.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '').substring(0, 2)
      if (cleanedInitials.length === 1) {
        cleanedInitials = cleanedInitials + cleanedInitials
      }
      backgroundColor = avatarVariant[(cleanedInitials.substring(0, 1).charCodeAt(0) + cleanedInitials.substring(1, 2).charCodeAt(0)) % avatarVariant.length]
    }

    if (this.src === undefined) {
      this.loaded = true
      this.placeholder = true
    }
    return (
      <Host>
        <div class={clsx(
          'avatar',
          this.hasInitials && 'initials',
          this.loaded ? 'loaded' : 'pending',
          this.placeholder && !this.hasInitials && 'fallback',
          backgroundColor,
        )}>
          { this.placeholder
            ? <div class={clsx(this.hasInitials ? 'initials-text' : 'fallback-image')}>
              { this.hasInitials && <mds-text typography="h5">{ this.initials.substring(0, 2) }</mds-text> }
            </div>
            : <mds-img
              class="image"
              loading="lazy"
              onLoadError={ () => { this.loaded = true; this.placeholder = true } }
              onLoadSuccess={ () => { this.loaded = true } }
              src={ this.src }
            />
          }
        </div>
      </Host>
    )
  }

}
