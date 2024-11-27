import { Component, Host, h, Prop, Element } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-paginator-item',
  styleUrl: 'mds-paginator-item.css',
  shadow: true,
})
export class MdsPaginatorItem {

  @Element() host: HTMLMdsPaginatorItemElement
  private km = new KeyboardManager()

  /**
   * Specifies the icon used inside the paginator item
   */
  @Prop({ reflect: true }) readonly icon?: string

  /**
   * Specifies if the item is selected or not, is handled from the parent paginator
   */
  @Prop({ reflect: true }) readonly selected?: boolean

  /**
   * Specifies if the item is disabled or not, is handled from the parent paginator
   */
  @Prop({ reflect: true }) readonly disabled?: boolean

  componentDidLoad (): void {
    this.km.addElement(this.host)
    this.km.attachClickBehavior()
  }

  componentDidUpdate (): void {
    if (!this.disabled && !this.selected) {
      this.km.attachClickBehavior()
      return
    }

    this.km.detachClickBehavior()
  }

  disconnectedCallback = (): void => {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host tabindex="0">
        { this.icon !== undefined
          ? <mds-icon class="icon" name={this.icon}/>
          : <mds-text class="text" typography="caption">
            <b><slot/></b>
          </mds-text>
        }
      </Host>
    )
  }

}
