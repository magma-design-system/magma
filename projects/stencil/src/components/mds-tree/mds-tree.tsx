import { Component, Host, h, Prop, Element } from '@stencil/core'

@Component({
  tag: 'mds-tree',
  styleUrl: 'mds-tree.css',
  shadow: true,
})
export class MdsTree {

  private hasActions: boolean

  @Element() private host: HTMLMdsTreeElement

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly label: string

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly depth: 'left'|'right' = 'left'

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly heiarchy: boolean

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly appearance: 'curved' | 'straight' | 'mixed' = 'straight'

  componentWillLoad (): void {
    this.hasActions = this.host.querySelector('[slot="actions"]') !== null
  }

  render () {
    return (
      <Host>
        <div>
          <mds-button class="label-action" variant="dark" tone="quiet">{ this.label }</mds-button>
          { this.hasActions &&
            <div class="actions">
              <slot name="action"></slot>
            </div>
          }
        </div>
        <div class="children">
          <slot></slot>
        </div>
      </Host>
    )
  }
}
