import { Component, Host, h, Element } from '@stencil/core'

/**
 * @slot default - Insert author information, name, role or other useful author infos.
 * @slot avatar - Insert the avatar image.
 */
@Component({
  tag: 'mds-author',
  styleUrl: 'mds-author.css',
  shadow: true,
})
export class MdsAuthor {

  private hasAvatar: boolean
  @Element() hostElement: HTMLMdsAuthorElement

  componentWillLoad (): void {
    this.hasAvatar = this.hostElement.querySelector('[slot="avatar"]') !== null
  }

  render () {
    return (
      <Host>
        { this.hasAvatar &&
          <div class="avatar">
            <slot name="avatar"/>
          </div>
        }
        <div class="info">
          <slot/>
        </div>
      </Host>
    )
  }

}
