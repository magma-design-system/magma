import { Component, Element, Host, h, State, Prop, Watch } from '@stencil/core'
import clsx from 'clsx'
import fitty from 'fitty'
import { avatarVariant } from './meta/variants'

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
  private fittyInitialized = false

  /**
   * Specifies the path to the image
   */
  @Prop() readonly src?: string

  /**
   * The user's inizials displayed if there's no image available
   */
  @Prop({ mutable:true, reflect: true }) readonly initials?: string

  private addFontResize = (): void => {
    console.log('addFontResize')
    const initialsElement = this.element.shadowRoot.querySelector('.fit')
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
    console.log('removeFontResize')
    this.fittyInitialized = false
    this.observer.unobserve(this.element)
  }

  private checkInitials = (value: string): void => {
    if (value !== undefined && value !== '') {
      this.hasInitials = true
      if (!this.fittyInitialized) {
        this.addFontResize()
      }
      return
    }
    this.hasInitials = false
    if (this.fittyInitialized) {
      this.removeFontResize()
    }
    this.fittyInitialized = false
  }

  componentDidRender (): void {
    this.checkInitials(this.initials)
  }

  @Watch('initials')
  initialsHandler (newValue: string): void {
    this.checkInitials(newValue)
  }

  render () {
    let backgroundColor = ''
    if (this.hasInitials) {
      let cleanedInitials = this.initials.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '').substring(0, 2)
      if (cleanedInitials.length === 1) {
        cleanedInitials = cleanedInitials + cleanedInitials
      }
      backgroundColor = avatarVariant[(cleanedInitials.substring(0, 1).charCodeAt(0) + cleanedInitials.substring(1, 2).charCodeAt(0)) % avatarVariant.length]
    }

    if (this.src === undefined) {
      this.loaded = true
      this.placeholder = true
    }
    return (
      <Host>
        <div class={clsx(
          'avatar',
          this.hasInitials && 'initials',
          this.loaded ? 'loaded' : 'pending',
          this.placeholder && !this.hasInitials && 'fallback',
          backgroundColor,
        )}>
          { this.placeholder
            ? <mds-text typography="h5" class={clsx( this.hasInitials ? 'initials-text' : 'fallback-image')}>
              { this.hasInitials && <span class="fit">{ this.initials.substring(0, 2) }</span> }
            </mds-text>
            : <mds-img
              class="image"
              loading="lazy"
              onLoadError={ () => { this.loaded = true; this.placeholder = true } }
              onLoadSuccess={ () => { this.loaded = true } }
              src={ this.src }
            />
          }
        </div>
      </Host>
    )
  }

}
