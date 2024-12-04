import { Component, Element, Host, h, Prop } from '@stencil/core'
import clsx from 'clsx'
import { NoiseType, PreloadType } from './meta/types'

/**
 * @slot default - Write browser support missing message here.
 * @slot content - Add video content overlay here, add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-video-wall',
  styleUrl: 'mds-video-wall.css',
  shadow: true,
})
export class MdsVideoWall {

  @Element() hostElement: HTMLMdsVideoWallElement
  private hasContent: boolean

  /**
   * Specifies that the video will start playing as soon as it is ready
   */
  @Prop() readonly autoplay = true

  /**
   * Specifies that the video will start over again, every time it is finished
   */
  @Prop() readonly loop = true

  /**
   * Specifies that the audio output of the video should be muted
   */
  @Prop() readonly muted = true

  /**
   * Specifies if the video has a noise overlay effect
   */
  @Prop() readonly noise?: NoiseType = 'none'

  /**
   * Specifies an image to be shown while the video is downloading
   */
  @Prop() readonly poster?: string

  /**
   * Specifies if and how the author thinks the video should be loaded when the page loads. Note: The preload attribute is ignored if autoplay is present
   */
  @Prop() readonly preload?: PreloadType = 'auto'

  /**
   * Specifies the URL of the video file
   */
  @Prop() readonly src?: string

  componentWillLoad (): void {
    this.hasContent = this.hostElement.querySelector('[slot="content"]') !== null
  }

  render () {
    return (
      <Host>
        { this.noise !== 'none' &&
          <div aria-hidden="true" class={clsx('noise', `noise--${this.noise}`)}/>
        }
        <video
          aria-hidden="true"
          autoplay={ this.autoplay }
          loop={ this.loop }
          muted={ this.muted }
          poster={ this.poster }
          preload={ this.preload }
          src={ this.src }
        >
          <slot></slot>
        </video>
        { this.hasContent &&
          <div class="content">
            <slot name="content"/>
          </div>
        }
      </Host>
    )
  }

}
