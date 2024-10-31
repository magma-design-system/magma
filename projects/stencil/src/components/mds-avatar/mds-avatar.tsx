import clsx from 'clsx'
import fitty from 'fitty/dist/fitty.min.js'
import { Component, Element, Host, h, State, Prop, Watch } from '@stencil/core'
import { ThemeFullVariantAvatarType, ToneMinimalVariantType } from '@type/variant'
import { avatarVariant } from './meta/variants'
import miBaselinePerson from '@icon/mi/baseline/person.svg'

/**
 * @part icon - The selected icon of the avatar
 * @part wrapper - The wrapper which contains media displayed
 */

@Component({
  tag: 'mds-avatar',
  styleUrl: 'mds-avatar.css',
  shadow: true,
})
export class MdsAvatar {

  // BUG: when user switch from initials to other and turn back to initials fitty breaks

  @Element() private element: HTMLMdsAvatarElement
  @State() fallback = false
  @State() loaded = true

  private observer: ResizeObserver
  private fittyElements
  private backgroundColor = ''
  private fittyInitialized = false
  private initialsChanged = false

  /**
   * Specifies the path to the icon
   * @see https://magma.maggiolicloud.it/storybook/?path=/story/design-icon--default
   */
  @Prop({ reflect: true }) readonly icon?: string|undefined

  /**
   * The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others
   */
  @Prop({ mutable:true, reflect: true }) readonly initials?: string

  /**
   * Specifies the path to the image
   */
  @Prop({ reflect: true }) readonly src?: string

  /**
   * Specifies the color tone of the component
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType

  /**
   * Specifies the color variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeFullVariantAvatarType

  private addFontResize = (): void => {
    if (this.fittyInitialized) {
      return
    }
    const initialsElement = this.element.shadowRoot?.querySelector('.fit')
    this.fittyElements = fitty(initialsElement as HTMLElement, { minSize: 10 })
    this.observer = new ResizeObserver(entries => {
      entries.forEach(() => {
        this.fittyElements.fit()
      })
    })
    this.observer.observe(this.element)
    this.fittyInitialized = true
  }

  private removeFontResize = (): void => {
    if (!this.fittyInitialized) {
      return
    }
    this.fittyInitialized = false
    this.observer.unobserve(this.element)
  }

  private checkInitials = (value?: string): void => {
    if (value !== '' && value !== undefined) {
      if (this.fittyInitialized) {
        return
      }
      if (!this.fittyInitialized) {
        this.addFontResize()
      }
      return
    }
    if (this.fittyInitialized) {
      this.removeFontResize()
    }
  }

  private checkInitialsBackground = (): void => {
    if (this.initials) {
      let cleanedInitials = this.initials.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '').substring(0, 2)
      if (cleanedInitials.length === 1) {
        cleanedInitials = cleanedInitials + cleanedInitials
      }
      this.backgroundColor = avatarVariant[(cleanedInitials.substring(0, 1).charCodeAt(0) + cleanedInitials.substring(1, 2).charCodeAt(0)) % avatarVariant.length]
    }
  }

  componentWillLoad (): void {
    this.checkInitialsBackground()
  }

  componentDidLoad (): void {
    if (this.src !== undefined) {
      this.loaded = false
    }
    this.checkInitials(this.initials)
  }

  componentDidRender (): void {
    if (this.initialsChanged) {
      // placed here becase @Watch('initials') is fired
      // BEFORE the element .fit is attached on shDOM
      this.checkInitials(this.initials)
      this.initialsChanged = false
    }
  }

  @Watch('initials')
  initialsHandler (): void {
    this.initialsChanged = true
    this.checkInitialsBackground()
  }

  @Watch('src')
  srcHandler (newValue: string): void {
    if (newValue === undefined) {
      this.loaded = true
    }
  }

  @Watch('icon')
  iconHandler (newValue: string): void {
    if (newValue !== undefined) {
      this.loaded = true
    }
  }

  render () {
    return (
      <Host>
        <div class={clsx(
          'avatar',
          this.initials && !this.fallback && !this.src && 'avatar--initials',
          (this.fallback || (!this.icon && !this.initials && !this.src)) && 'avatar--fallback',
          this.icon && 'avatar--icon',
          this.loaded ? 'avatar--loaded' : 'avatar--pending',
          this.initials ? this.backgroundColor : '',
        )} part="wrapper">
          { this.initials && !this.fallback && !this.src && <div class="initials-text">
            <span class="fit">{ this.initials.substring(0, 2) }</span>
          </div>
          }
          { this.src && !this.fallback && !this.icon && <mds-img
            class="image"
            loading="lazy"
            onMdsImgLoadError={ () => { this.loaded = true; this.fallback = true } }
            onMdsImgLoadSuccess={ () => { this.loaded = true } }
            src={ this.src }
          />
          }
          { this.icon && !this.initials && <mds-icon class="icon" part="icon" name={this.icon}></mds-icon> }
          { (this.fallback || (!this.icon && !this.initials && !this.src)) && <i class="fallback-icon" innerHTML={miBaselinePerson}/> }
        </div>
      </Host>
    )
  }
}
