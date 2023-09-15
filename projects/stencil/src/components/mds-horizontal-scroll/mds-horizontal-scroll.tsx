import { Component, Host, h, Prop } from '@stencil/core'
import clsx from 'clsx'

import { SnapType } from './meta/types'

@Component({
  tag: 'mds-horizontal-scroll',
  styleUrl: 'mds-horizontal-scroll.css',
  shadow: true,
})
export class MdsHorizontalScroll {

  /**
   * Specifies the box’s snap position as an alignment of its snap area
   */
  @Prop() readonly snap?: SnapType = 'start'

  /**
   * Specifies the box’s snap position as an alignment of its snap area
   */
  @Prop() readonly scrollbar?: boolean

  /**
 * @slot default - Put elements here
 */

  render () {
    return (
      <Host class={clsx(
        `scroll--align-${this.snap}`,
        this.scrollbar ? 'scroll--show-scrollbar' : 'scroll--hide-scrollbar',
      )}>
        <slot/>
      </Host>
    )
  }

}
