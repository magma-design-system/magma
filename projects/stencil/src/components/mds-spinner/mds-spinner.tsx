import { Component, Host, h, Prop } from '@stencil/core'
import awaitIcon from './assets/await-rounded.svg'

@Component({
  tag: 'mds-spinner',
  styleUrl: 'mds-spinner.css',
  shadow: true,
})
export class MdsSpinner {

  /**
   * Specifies if the animation is running or not, it's required for performance reasons
   */
  @Prop({ reflect: true }) readonly running?: boolean = false

  render () {
    return (
      <Host>
        <i class="await-icon" innerHTML={awaitIcon}/>
      </Host>
    )
  }
}
