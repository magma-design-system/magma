import { Component, Host, h, State, Prop } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-modal',
  styleUrl: 'mds-modal.css',
  shadow: true,
})
export class MdsModal {

  @State() isOpened:boolean

  /**
   * Specifies if the modal is opened or not
   */
  @Prop({ reflect: true }) opened?: boolean

  render () {
    return (
      <Host class={clsx(this.opened && 'opened')}>
        <slot name="window"/>
      </Host>
    )
  }

}
