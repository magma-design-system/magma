import { Component, Host, h, Prop } from '@stencil/core'
import { DirectionType } from './meta/types'

@Component({
  tag: 'mds-progress',
  styleUrl: 'mds-progress.css',
  shadow: true,
})
export class MdsProgress {

  /**
   * A value between 0 and 1 that rapresents the status progress
   */
  @Prop() readonly progress?: number = 0

  /**
   * Specifies the direction of the progress bar, if horizonatl or vertical
   */
  @Prop() readonly direction?: DirectionType = 'horizontal'

  render () {
    return (
      <Host class={this.direction}>
        <div class="progress" style={
          this.direction === 'horizontal'
            ? { flexGrow: `${this.progress}` }
            : { flexGrow: `${this.progress}`, width: '100%' }
        }></div>
      </Host>
    )
  }
}
