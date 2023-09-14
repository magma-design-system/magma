import { Component, Host, h, Element } from '@stencil/core'

/**
 * @slot avatar - TODOSLOT
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
