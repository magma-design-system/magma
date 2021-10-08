import { Component, Host, h, Prop } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-notification',
  styleUrl: 'mds-notification.css',
  shadow: true,
})
export class MdsNotification {

  /**
   * Specifies number of notifications to display,
   * if it set to 0, the element will be hidden
   */
  @Prop() readonly value?: number = 0

  render () {
    return (
      <Host class={clsx(this.value === 0 && 'mds-notification--hidden')}>
        <mds-text typography="caption">
          { Number(this.value).toLocaleString() }
        </mds-text>
      </Host>
    )
  }

}
