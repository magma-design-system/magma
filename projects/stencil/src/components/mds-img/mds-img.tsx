import { Component, Element, Event, EventEmitter, Host, h, Prop, State, Watch } from '@stencil/core'
import { CrossoriginType, ReferrerpolicyType, ImageConsumptionType } from './meta/types'
import { LoadingType } from '@type/loading'
import { MdsImgEventDetail } from './meta/event-detail'
import { setAttributeIfEmpty } from '@common/aria'
import { ConsumptionModeType } from '@type/preference'

@Component({
  tag: 'mds-img',
  styleUrl: 'mds-img.css',
  shadow: true,
})
export class MdsImg {

  private aspectRatioModern = false
  @Element() private host: HTMLMdsImgElement
  private image: HTMLImageElement
  private consumptionMode: ConsumptionModeType = 'high'
  private srcsetConsumptionData?: ImageConsumptionType
  @State() imageConsumptionLoaded: boolean = false

  /**
   * Specifies an alternate text for an image
   */
  @Prop({ mutable: true, reflect: true }) alt: string = ''

  /**
   * Specifies the aspect ratio of the image, useful to render all images of a list with the same proportions.
   * When defined, mds-img will render the Host element with background-image instead of wrapping ad img element.
   * This will drop all atributes useful for img elements only: alt, crossorigin, height, loading, referrerpolicy, sizes, src, srcset, width
   */
  @Prop() readonly aspectRatio: string = ''

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
   * Defines multiple sizes of the same image, allowing the browser
   * to select the appropriate image source.
   */
  @Prop() readonly srcset?: string

  /**
   * Specifies a list of image files to use in different situations.
   * Defines multiple sizes of the same image, allowing the browser
   * to select the appropriate image source based on consumption configuration.
   * ```
   * <mds-img srcset-consumption="image-black-n-white-1x.jpg low, image-1x.jpg medium, image-2x.jpg high"></mds-img>
   * ```
   */
  @Prop() readonly srcsetConsumption?: string

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

  @Watch('srcsetConsumption')
  srcsetConsumptionHandler (newValue: string): void {
    this.srcsetConsumptionData = this.formatConsumptionData(newValue)
  }

  private formatConsumptionData = (consumptionData: string): ImageConsumptionType => {

    const imageConsumptionData: ImageConsumptionType = { }

    consumptionData.split(',').forEach(element => {
      const item = element.trim().replace(/[ ]{2,}/g, ' ').split(' ')
      if (item[1].toLocaleLowerCase() === 'low') {
        imageConsumptionData.low = item[0]
      }

      if (item[1].toLocaleLowerCase() === 'medium') {
        imageConsumptionData.medium = item[0]
      }

      if (item[1].toLocaleLowerCase() === 'high') {
        imageConsumptionData.high = item[0]
      }
    })

    return imageConsumptionData
  }

  private autoAltName (): string {
    if (this.src) {
      const index = this.src.lastIndexOf('/') + 1
      return this.src.substring(index)
    }
    return ''
  }

  componentWillLoad ():void {
    this.consumptionMode = localStorage.getItem('mds-pref-consumption') as ConsumptionModeType ?? 'high'
    if (this.srcsetConsumption) {
      this.srcsetConsumptionData = this.formatConsumptionData(this.srcsetConsumption)
    }

    this.image = this.host.querySelector<HTMLImageElement>('img') as HTMLImageElement
    if (!this.alt) {
      this.alt = this.autoAltName()
    }
  }

  private setAriaAttributes (): void {
    if (this.aspectRatio !== '') {
      setAttributeIfEmpty(this.host, 'aria-label', this.alt)
    }
  }

  componentDidLoad (): void {
    this.setAriaAttributes()
  }

  render () {


    if (this.srcsetConsumptionData) {
      if (this.consumptionMode === 'low') {
        if (this.aspectRatio === '') {
          return (
            <Host aria-label={this.alt} role="img" onClick={() => { this.imageConsumptionLoaded = true }}>
              { !this.imageConsumptionLoaded
                ? <div class="alt-text-container alt-text-container--default-aspect-ratio">
                  <mds-text class="alt-text" aria-hidden="true" typography="h6"><i>{ this.alt }</i></mds-text>
                </div>
                : <img
                  alt={this.alt}
                  aria-hidden="true"
                  height={this.height}
                  loading={this.loading}
                  onError={this.onError}
                  onLoad={this.onSuccess}
                  part="media"
                  sizes={this.sizes}
                  src={this.srcsetConsumptionData[this.consumptionMode] ?? this.src}
                  srcset={this.srcset}
                  width={this.width}
                />
              }
            </Host>
          )
        }
        return (
          <Host
            aria-label={this.alt}
            role="img"
            onClick={() => { this.imageConsumptionLoaded = true }}
            style={{ ...this.getAspectRatio(), backgroundImage: this.imageConsumptionLoaded ? `url(${this.srcsetConsumptionData[this.consumptionMode] ?? this.src})` : 'unset', width: '100%' }}>
            { !this.imageConsumptionLoaded
                && <div class="alt-text-container alt-text-container--absolute">
                  <mds-text class="alt-text" aria-hidden="true" typography="h6"><i>{ this.alt }</i></mds-text>
                </div>
            }
          </Host>
        )
      }

      if (this.aspectRatio === '') {
        return (
          <Host aria-label={this.alt} role="img">
            <img
              alt={this.alt}
              aria-hidden="true"
              height={this.height}
              loading={this.loading}
              onError={this.onError}
              onLoad={this.onSuccess}
              part="media"
              sizes={this.sizes}
              src={this.srcsetConsumptionData[this.consumptionMode] ?? this.src}
              srcset={this.srcset}
              width={this.width}
            />
          </Host>
        )
      }
      return (
        <Host
          aria-label={this.alt}
          role="img"
          style={{ ...this.getAspectRatio(), backgroundImage: `url(${this.srcsetConsumptionData[this.consumptionMode] ?? this.src})`, width: '100%' }}>
        </Host>
      )
    }

    if (this.aspectRatio !== '') {
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
          part="media"
          sizes={this.sizes}
          src={this.src}
          srcset={this.srcset}
          width={this.width}
        />
      </Host>
    )
  }

}
