import { Component, Element, Host, h, State, Prop, Watch } from '@stencil/core'
import clsx from 'clsx'
import { avatarVariant } from './meta/variants'
import fitty from 'fitty/dist/fitty.min.js'
import { ThemeFullVariantAvatarType, ToneMinimalVariantType } from '@type/variant'

@Component({
  tag: 'mds-avatar',
  styleUrl: 'mds-avatar.css',
  shadow: true,
})
export class MdsAvatar {

  @Element() private element: HTMLMdsAvatarElement
  @State() placeholder = false
  @State() loaded = false
  @State() hasInitials = false

  private observer: ResizeObserver
  private fittyElements
  private backgroundColor = ''
  private fittyInitialized = false

  /**
   * Specifies the path to the icon
   * @see https://magma.maggiolicloud.it/storybook/?path=/story/design-icon--default
   */
  @Prop() readonly icon?: string|undefined

  /**
   * The user's inizials displayed if there's no image available
   */
  @Prop({ mutable:true, reflect: true }) readonly initials: string = ''

  /**
   * Specifies the path to the image
   */
  @Prop() readonly src?: string

  /**
   * Specifies the color tone of the component
   */
  @Prop() readonly tone?: ToneMinimalVariantType

  /**
   * Specifies the color variant of the component
   */
  @Prop() readonly variant?: ThemeFullVariantAvatarType

  private addFontResize = (): void => {
    const initialsElement = this.element.shadowRoot?.querySelector('.fit')
    if (initialsElement === null) {
      return
    }
    if (!this.observer) {
      this.fittyElements = fitty(initialsElement as HTMLElement, { minSize: 10 })
      this.observer = new ResizeObserver(entries => {
        entries.forEach(() => {
          this.fittyElements.fit()
        })
      })
    }
    this.observer.observe(this.element)
    this.fittyInitialized = true
  }

  private removeFontResize = (): void => {
    this.fittyInitialized = false
    this.observer.unobserve(this.element)
  }

  private checkInitials = (value: string): void => {
    if (value !== '' && !this.src) {
      if (this.fittyInitialized) {
        return
      }
      this.hasInitials = true
      if (!this.fittyInitialized) {
        this.addFontResize()
        console.info('addFontResize')
      }
      return
    }
    this.hasInitials = false
    if (this.fittyInitialized) {
      this.removeFontResize()
      console.info('removeFontResize')
    }
  }

  private checkInitialsBackground = (): void => {
    if (this.hasInitials) {
      let cleanedInitials = this.initials.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '').substring(0, 2)
      if (cleanedInitials.length === 1) {
        cleanedInitials = cleanedInitials + cleanedInitials
      }
      this.backgroundColor = avatarVariant[(cleanedInitials.substring(0, 1).charCodeAt(0) + cleanedInitials.substring(1, 2).charCodeAt(0)) % avatarVariant.length]
    }

    if (this.src === undefined) {
      this.placeholder = true
      this.loaded = true
    }
    if (this.icon !== undefined) {
      this.loaded = true
    }
  }

  componentDidRender (): void {
    this.checkInitials(this.initials)
    this.checkInitialsBackground()
  }

  componentDidLoad (): void {
    this.checkInitials(this.initials)
    this.checkInitialsBackground()
  }

  @Watch('initials')
  initialsHandler (newValue: string): void {
    this.checkInitials(newValue)
  }

  render () {
    return (
      <Host>
        <div class={clsx(
          'avatar',
          this.hasInitials && 'initials',
          this.loaded ? 'loaded' : 'pending',
          this.placeholder && !this.hasInitials && 'fallback',
          this.backgroundColor,
        )}>
          { this.placeholder
            ? <mds-text typography="h5" class={clsx( this.hasInitials ? 'initials-text' : 'fallback-image')}>
              { this.hasInitials && <span class="fit">{ this.initials.substring(0, 2) }</span> }
            </mds-text>
            : <mds-img
              class="image"
              loading="lazy"
              onMdsImgLoadError={ () => { this.loaded = true; this.placeholder = true } }
              onMdsImgLoadSuccess={ () => { this.loaded = true } }
              src={ this.src }
            />
          }
          { this.icon && !this.hasInitials && <mds-icon class="icon" name={this.icon}></mds-icon> }
        </div>
      </Host>
    )
  }

}
