import { Component, Host, h, State, Prop } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-avatar',
  styleUrl: 'mds-avatar.css',
  shadow: true,
})
export class MdsAvatar {

  @State() placeholder = false
  @State() loaded = false

  /**
   * Specifies the path to the image
   */
  @Prop() readonly src?: string

  /**
   * The user's inizials displayed if there's no image available
   */
  @Prop() readonly initials?: string

  render () {
    if (this.src === undefined) {
      this.loaded = true
      this.placeholder = true
    }
    return (
      <Host class={clsx(
        this.initials !== undefined && 'initials',
        this.loaded && 'loaded',
        this.placeholder && 'fallback',
      )}>
        { this.placeholder
          ? <div class={clsx(this.initials !== undefined ? 'initials-text' : 'fallback-image')}>
            { this.initials !== undefined && <mds-text typography="h4">{ this.initials.substring(0, 2) }</mds-text> }
          </div>
          : <mds-img
            class="image"
            loading="lazy"
            onLoadError={ () => { this.loaded = true; this.placeholder = true } }
            onLoadSuccess={ () => { this.loaded = true } }
            src={ this.src }
          />
        }
      </Host>
    )
  }

}
