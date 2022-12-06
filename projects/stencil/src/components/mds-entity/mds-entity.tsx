import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import miBaselineClose from '@icon/mi/baseline/close.svg'
@Component({
  tag: 'mds-entity',
  styleUrl: 'mds-entity.css',
  shadow: true,
})
export class MdsEntity {

  @Element() private hostElement: HTMLMdsEntityElement
  private details: boolean

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deleteLabel? = 'Rimuovi'

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

  /**
   * Emits when the component's delete button is clicked
   */
  @Event() delete: EventEmitter<void>

  componentWillLoad (): void {
    this.details = this.hostElement.querySelector('[slot="detail"]') !== null
  }

  private onDeleteHandler (): void {
    this.delete.emit()
  }

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
        { this.deletable &&
          <div class="delete" onClick={ this.onDeleteHandler.bind(this) } role="button" tabindex="0" title={ this.deleteLabel }>
            <i aria-hidden="true" class="svg" innerHTML={miBaselineClose}/>
          </div>
        }
      </Host>
    )
  }

}
