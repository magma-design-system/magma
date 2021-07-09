import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyTypes } from '../../types'
import clsx from 'clsx'

@Component({
  tag: 'mds-label',
  styleUrl: 'mds-label.css',
  shadow: true,
})
export class MdsLabel {

  /**
   * Truncates text inside the label or displays it in multiline if needed
   */
  @Prop() readonly truncate?: boolean = true

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyTypes = 'detail'

  /**
   * Displays a close / delete button to the right of the label
   * and calls a callback function when the button in clicked
   */
  // @Method()
  // async onClickDelete(log: string) {
  //   console.log(log)
  //   onClick={this.onClickDelete('clicked')}
  // }

  render() {
    return (
      <Host>
        <mds-text part="text" typography={this.typography} class={clsx('flex-grow min-w-0', this.truncate && 'truncate')}>
          <slot></slot>
        </mds-text>
        <mds-icon name="action-close" class="bg-adjust-tone hover:bg-adjust-tone-20 transition-colors bg-opacity-50 cursor-pointer flex-shrink-0 ml-1 rounded-full text-inherit"/>
      </Host>
    )
  }
}
