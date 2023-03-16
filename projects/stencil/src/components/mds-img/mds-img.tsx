import { Component, Element, Event, EventEmitter, Host, h, Prop } from '@stencil/core'
import { CrossoriginType, ReferrerpolicyType } from './meta/types'
import { LoadingType } from '@type/loading'
import { MdsImgEventDetail } from './meta/event-detail'
import { setAttributeIfEmpty } from '@common/aria'

@Component({
  tag: 'mds-img',
  styleUrl: 'mds-img.css',
  shadow: true,
})
export class MdsImg {

  private aspectRatioModern = false
  @Element() private host: HTMLMdsImgElement
  private image: HTMLImageElement

  /**
   * Specifies an alternate text for an image
   */
  @Prop({ mutable: true, reflect: true }) alt?: string

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
  @Prop() readonly crossorigin?: CrossoriginType = 'use-credentials'

  /**
   * The height attribute specifies the height of an image, in pixels.
   */
  @Prop() readonly height?: string

  /**
   * Specifies whether a browser should load an image immediately
   * or to defer loading of images until some conditions are met.
   */
  @Prop() readonly loading?: LoadingType = 'lazy'

  /**
   * Specifies which referrer information to use when fetching an image.
   */
  @Prop() readonly referrerpolicy?: ReferrerpolicyType = 'no-referrer-when-downgrade'

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

  private aspectRatioPaddingTop () {
    const ratioBase = parseInt(this.aspectRatio.split('/')[1])
    const ratioDivisor = parseInt(this.aspectRatio.split('/')[0])
    return `${(ratioBase / ratioDivisor * 100).toFixed(2)}%`
  }

  private aspectRatioSanitized () {
    return `${this.aspectRatio.split('/')[0]} / ${this.aspectRatio.split('/')[1]}`
  }

  private getAspectRatio () {
    if (this.aspectRatioModern) {
      return { aspectRatio: this.aspectRatioSanitized() }
    }
    return { paddingTop: this.aspectRatioPaddingTop() }
  }

  /**
   * Emits when the image is not loaded
   */
  @Event({ eventName: 'mdsImgLoadError' }) loadErrorEvent: EventEmitter<MdsImgEventDetail>

  private onError = (ev: Event) => {
    this.image = ev.target as HTMLImageElement
    this.loadErrorEvent.emit({ image: this.image })
  }

  /**
   * Emits when the image is successfully loaded
   */
  @Event({ eventName: 'mdsImgLoadSuccess' }) loadSuccessEvent: EventEmitter<MdsImgEventDetail>

  private onSuccess = (ev: Event) => {
    this.image = ev.target as HTMLImageElement
    this.loadSuccessEvent.emit({ image: this.image })
  }

  private autoAltName (): string {
    if (this.src) {
      const index = this.src.lastIndexOf('/') + 1
      return this.src.substring(index)
    }
  }

  componentWillLoad ():void {
    this.image = this.host.querySelector<HTMLImageElement>('img')
    if (!this.alt) {
      this.alt = this.autoAltName()
    }
  }

  private setAriaAttributes (): void {
    if (this.aspectRatio !== undefined) {
      setAttributeIfEmpty(this.host, 'aria-label', this.alt)
    }
  }

  componentDidLoad (): void {
    this.setAriaAttributes()
  }

  render () {
    if (this.aspectRatio !== undefined) {
      return (
        <Host
          aria-label={this.alt}
          role="img"
          style={{ ...this.getAspectRatio(), backgroundImage: `url(${this.src})`, width: '100%' }}
        />
      )
    }

    return (
      <Host aria-label={this.alt} role="img">
        <img
          alt={this.alt}
          aria-hidden="true"
          height={this.height}
          loading={this.loading}
          onError={this.onError}
          onLoad={this.onSuccess}
          sizes={this.sizes}
          src={this.src}
          srcset={this.srcset}
          width={this.width}
        />
      </Host>
    )
  }

}
