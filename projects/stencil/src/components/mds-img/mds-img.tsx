import { Component, Host, h, Prop } from '@stencil/core'
import { CrossoriginTypes } from '../../types/crossorigin'
import { LoadingTypes } from '../../types/loading'
import { ReferrerpolicyTypes } from '../../types/referrerpolicy'

@Component({
  tag: 'mds-img',
  styleUrl: 'mds-img.css',
  shadow: true,
})
export class MdsImg {

  private aspectRatioModern = false

  /**
   * Specifies an alternate text for an image
   */
  @Prop() alt?: string

  /**
   * Specifies the aspect ratio of the image, useful to render all images of a list with the same proportions.
   * When defined, mds-img will render the Host element with background-image instead of wrapping ad img element.
   * This will drop all atributes useful for img elements only: alt, crossorigin, height, loading, referrerpolicy, sizes, src, srcset, width
   */
  @Prop() readonly aspectRatio?: string

  /**
   * Allow images from third-party sites that allow
   * cross-origin access to be used with canvas
   */
  @Prop() readonly crossorigin?: CrossoriginTypes = 'use-credentials'

  /**
   * The height attribute specifies the height of an image, in pixels.
   */
  @Prop() readonly height?: string

  /**
   * Specifies whether a browser should load an image immediately
   * or to defer loading of images until some conditions are met.
   */
  @Prop() readonly loading?: LoadingTypes = 'lazy'

  /**
   * Specifies which referrer information to use when fetching an image.
   */
  @Prop() readonly referrerpolicy?: ReferrerpolicyTypes = 'no-referrer-when-downgrade'

  /**
   * One or more strings separated by commas, indicating a set of source sizes.
   * https://medium.com/@MRWwebDesign/responsive-images-the-sizes-attribute-and-unexpected-image-sizes-882a2eadb6db
   */
  @Prop() readonly sizes?: string

  /**
   * Specifies the path to the image
   */
  @Prop() readonly src: string

  /**
   * Specifies a list of image files to use in different situations.
   * Defines multiple sizes of the same image, allowing the browser to select the appropriate image source.
   */
  @Prop() readonly srcset?: string

  /**
   * The width attribute specifies the width of an image, in pixels.
   */
  @Prop() readonly width?: string

  private aspectRatioPaddingTop() {
    const ratioBase = parseInt(this.aspectRatio.split('/')[1])
    const ratioDivisor = parseInt(this.aspectRatio.split('/')[0])
    return `${(ratioBase / ratioDivisor * 100).toFixed(2)}%`
  }

  private aspectRatioSanitized() {
    return `${this.aspectRatio.split('/')[0]} / ${this.aspectRatio.split('/')[1]}`
  }

  private getAspectRatio() {
    if (this.aspectRatioModern) {
      return { aspectRatio: this.aspectRatioSanitized() }
    }
    return { paddingTop: this.aspectRatioPaddingTop() }
  }

  render() {
    if (this.aspectRatio !== undefined) {
      return (
        <Host
          style={{ ...this.getAspectRatio(), backgroundImage: `url(${this.src})` }}
        />
      )
    }

    return (
      <Host>
        <img
          alt={this.alt}
          // crossorigin={this.crossorigin}
          height={this.height}
          loading={this.loading}
          // referrerpolicy={this.referrerpolicy}
          sizes={this.sizes}
          src={this.src}
          srcset={this.srcset}
          width={this.width}
        />
      </Host>
    )
  }

}
