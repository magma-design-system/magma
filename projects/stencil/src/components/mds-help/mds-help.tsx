import { Component, Host, Prop, h } from '@stencil/core'
import { hashRandomValue } from '@common/aria'
import miOutlineHelp from '@icon/mi/outline/help-outline.svg'
import { FloatingUIPlacement } from '@type/floating-ui'

/**
  * @slot default - Add `text string` to this slot, **avoid** `HTML elements` or `components`.
  */

@Component({
  tag: 'mds-help',
  styleUrl: 'mds-help.css',
  shadow: true,
})
export class MdsHelp {

  private id: string

  /**
   * Set the name of the icon.
   */
  @Prop() readonly icon?: string

  /**
   * If set, the component will be placed automatically near it's caller.
   */
  @Prop({ reflect: true }) readonly autoPlacement?: boolean = true

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop({ reflect: true }) readonly placement?: FloatingUIPlacement = 'top'

  componentWillLoad (): void {
    this.id = hashRandomValue('mds-help')
  }

  render () {
    return (
      <Host>
        <mds-icon id={this.id} name={ this.icon ?? miOutlineHelp }></mds-icon>
        <mds-tooltip placement={this.placement} autoPlacement={this.autoPlacement} strategy="fixed" target={'#' + this.id}>
          <slot/>
        </mds-tooltip>
      </Host>
    )
  }

}
