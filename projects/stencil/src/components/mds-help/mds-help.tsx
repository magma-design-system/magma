import { Component, Host, Prop, h } from '@stencil/core'
import { hashRandomValue } from '@common/aria'
import miOutlineHelp from '@icon/mi/outline/help-outline.svg'

@Component({
  tag: 'mds-help',
  styleUrl: 'mds-help.css',
  shadow: false,
})
export class MdsHelp {

  private id: string

  /**
   * Set the name of the icon.
   */
  @Prop() readonly icon: string = 'mi/outline/help-outline'

  componentWillLoad (): void {
    this.id = hashRandomValue('mds-help')
  }

  render () {
    return (
      <Host>
        { this.icon
          ? <mds-icon id={this.id} name={ this.icon }></mds-icon>
          : <i id={this.id} innerHTML={miOutlineHelp}/>
        }
        <mds-tooltip target={'#' + this.id}>
          <slot/>
        </mds-tooltip>
      </Host>
    )
  }

}
