import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core'
import { CrossoriginType, ReferrerpolicyType, ImageConsumptionType } from './meta/types'
import { LoadingType } from '@type/loading'
import { MdsImgEventDetail } from './meta/event-detail'
import { setAttributeIfEmpty } from '@common/aria'
import { ConsumptionModeType } from '@type/preference'
import miBaselinePanorama from '@icon/mi/baseline/panorama.svg'
import miBaselineBrokenImage from '@icon/mi/baseline/broken-image.svg'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

@Component({
  tag: 'mds-img',
  styleUrl: 'mds-img.css',
  shadow: true,
})
export class MdsImg {

  @Element() private host: HTMLMdsImgElement
  @State() imageConsumptionLoaded: boolean = false
  @State() imageError: boolean = false
  private consumptionMode: ConsumptionModeType = 'high'
  private image: HTMLImageElement
  private srcsetConsumptionData?: ImageConsumptionType
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  /**
   * Specifies an alternate text for an image
   */
  @Prop({ mutable: true, reflect: true }) alt: string = ''

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

  /**
   * Emits when the image is not loaded
   */
  @Event({ eventName: 'mdsImgLoadError' }) loadErrorEvent: EventEmitter<MdsImgEventDetail>

  /**
   * Emits when the image is successfully loaded
   */
  @Event({ eventName: 'mdsImgLoadSuccess' }) loadSuccessEvent: EventEmitter<MdsImgEventDetail>


  @Watch('srcsetConsumption')
  srcsetConsumptionHandler (newValue: string): void {
    this.srcsetConsumptionData = this.formatConsumptionData(newValue)
  }

  private onSuccess = (ev: Event) => {
    this.image = ev.target as HTMLImageElement
    this.loadSuccessEvent.emit({ image: this.image })
  }

  private onError = (ev: Event) => {
    this.image = ev.target as HTMLImageElement
    this.loadErrorEvent.emit({ image: this.image })
    this.imageError = true
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

  private autoAltName = (): string => {
    if (this.src) {
      const index = this.src.lastIndexOf('/') + 1
      return this.src.substring(index)
    }
    return ''
  }

  private setAriaAttributes = (): void => {
    setAttributeIfEmpty(this.host, 'aria-label', this.alt)
  }

  componentWillLoad ():void {
    this.consumptionMode = localStorage.getItem('mdsPrefConsumption') as ConsumptionModeType ?? 'high'
    if (this.srcsetConsumption) {
      this.srcsetConsumptionData = this.formatConsumptionData(this.srcsetConsumption)
    }

    this.image = this.host.querySelector<HTMLImageElement>('img') as HTMLImageElement
    if (!this.alt) {
      this.alt = this.autoAltName()
    }
  }

  componentWillRender (): void {
    this.t.lang(this.host)
  }

  componentDidLoad (): void {
    this.setAriaAttributes()
  }

  render () {

    if (this.imageError) {
      return (
        <Host aria-label={this.alt} role="img">
          <div class="contrast-area-50"></div>
          <div class="alt-text-container alt-text-container--error alt-text-container--default-aspect-ratio">
            <mds-icon class="icon" name={miBaselineBrokenImage}></mds-icon>
            <mds-text class="alt-text" aria-hidden="true" typography="h6"><i>{ this.alt }</i></mds-text>
          </div>
        </Host>
      )
    }

    if (this.srcsetConsumptionData) {
      if (this.consumptionMode === 'low') {
        return (
          <Host aria-label={this.alt} role="img" onClick={() => { this.imageConsumptionLoaded = true }}>
            <div class="contrast-area-50"></div>
            { !this.imageConsumptionLoaded
              ? <div aria-hidden="true" class="alt-text-container alt-text-container--default-aspect-ratio">
                <mds-icon class="icon" name={miBaselinePanorama}></mds-icon>
                <mds-text class="alt-text" typography="h6"><i>{ this.alt }</i></mds-text>
                <mds-button aria-hidden="true" role="none" class="click-to-load" tabIndex={-1} variant="light" tone="ghost">{ this.t.get('clickToLoad') }</mds-button>
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
        <Host aria-label={this.alt} role="img">
          <div class="contrast-area-50"></div>
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
      <Host aria-label={this.alt} role="img">
        <div class="contrast-area-50"></div>
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
