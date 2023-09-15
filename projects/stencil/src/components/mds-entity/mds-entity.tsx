import { Component, Element, Host, h, Prop } from '@stencil/core'

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
   * Specifies the icon to be displayed if src propery is not used
   */
  @Prop() readonly icon?: string

  /**
   * Specifies the path to the image
   */
  @Prop() readonly src?: string

  /**
   * The user's inizials displayed if there's no image available and icon is not set
   */
  @Prop() readonly initials?: string

  componentWillLoad (): void {
    this.details = this.hostElement.querySelector('[slot="detail"]') !== null
    this.actions = this.hostElement.querySelector('[slot="action"]') !== null
  }

  /**
 * @slot default - Put the entity title here, it represent what is this entity
 * @slot detail - Put additional information here, supposed to support the entity definition
 * @slot action - Insert one or more actions here, it is strongly recommended not to use more than 2 actions
 */

  render () {
    return (
      <Host>
        { this.src &&
          <mds-avatar class="avatar" src={this.src} initials={this.initials}/>
        }
        { this.icon &&
          <div class="icon">
            <mds-icon name={this.icon}/>
          </div>
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
