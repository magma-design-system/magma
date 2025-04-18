import { Component, Host, Prop, Element, h, Watch } from '@stencil/core'
import { ButtonSizeType, ButtonVariantType } from '@type/button'
import { Direction, Interaction } from './meta/types'
import miBaselineMoreVert from '@icon/mi/baseline/more-vert.svg'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import clsx from 'clsx'
import { ToneVariantType } from '@type/variant'

@Component({
  tag: 'mds-radial-menu',
  styleUrl: 'mds-radial-menu.css',
  shadow: true,
})
export class MdsRadialMenu {
  @Element() private hostElement: HTMLMdsCardHeaderElement

  @Prop({ reflect: true }) readonly angleStart?: number = 0

  @Prop({ reflect: true }) readonly angleEnd?: number = 360

  @Prop({ reflect: true }) readonly radius?: number = 5

  @Prop({ reflect: true }) readonly direction?: Direction = 'clockwise'

  @Prop({ mutable: true, reflect: true }) opened?: boolean

  @Prop({ reflect: true }) readonly disc?: boolean

  @Prop({ reflect: true }) readonly interaction?: Interaction = 'click'

  /**
   * The icon displayed in the button
   */
  @Prop({ reflect: true, mutable: true }) icon?: string

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonVariantType = 'dark'

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'strong'

  /**
   * Specifies the size for the button
   */
  @Prop({ reflect: true }) readonly size: ButtonSizeType = 'lg'

  private items: NodeListOf<HTMLMdsRadialMenuItemElement>

  private toggleMenu = (): void => {
    if (this.opened === true) {
      this.opened = undefined
      return
    }
    this.opened = true
  }

  private setItemSize = (): void => {
    this.items.forEach((item: HTMLMdsRadialMenuItemElement) => { item.size = this.size })
  }

  private setItemIndex = (): void => {
    this.items.forEach((item: HTMLMdsRadialMenuItemElement, index: number) => {
      item.style.setProperty('--mds-radial-menu-item-index', index.toString())
    })
  }

  private setFullCircle = (): void => {
    const isFullCircle = (this.angleEnd! - this.angleStart! === 360) ? '1' : '0'
    this.hostElement.style.setProperty('--mds-radial-menu-is-full-circle', isFullCircle)
  }

  componentWillLoad (): void {
    this.icon = this.icon ?? miBaselineMoreVert
    this.onAngleStartChange(this.angleStart)
    this.onAngleEndChange(this.angleEnd)
    this.onRadiusChange(this.radius)
    this.onSizeChange()
  }

  componentDidLoad (): void {
    this.items = this.hostElement.querySelectorAll(':scope > [slot="item"]')
    this.setItemSize()
    this.setItemIndex()
    this.setFullCircle()
    this.hostElement.style.setProperty('--mds-radial-menu-nth-siblings', (this.items.length - 1).toString())
    this.onOpenedChange(this.opened)
    this.onInteractionChange(this.interaction)
  }

  disconnectedCallback (): void {
    if (!document) return
    document.removeEventListener('contextmenu', this.toggleRightClickMenu)
  }

  private toggleRightClickMenu = (e: MouseEvent): void => {
    e.preventDefault()
    this.hostElement.style.top = `${e.clientY - this.hostElement.offsetHeight / 2}px`
    this.hostElement.style.left = `${e.clientX - this.hostElement.offsetWidth / 2}px`
    this.toggleMenu()
  }

  @Watch('interaction')
  onInteractionChange (newValue?: Interaction): void {
    if (!document) return
    if (newValue === 'rightclick') {
      document.addEventListener('contextmenu', this.toggleRightClickMenu)
      return
    }
    document.removeEventListener('contextmenu', this.toggleRightClickMenu)
  }

  @Watch('angleStart')
  onAngleStartChange (newValue?: number): void {
    this.hostElement.style.setProperty('--mds-radial-menu-angle-start', `${newValue}deg`)
    this.setFullCircle()
  }

  @Watch('angleEnd')
  onAngleEndChange (newValue?: number): void {
    this.hostElement.style.setProperty('--mds-radial-menu-angle-end', `${newValue}deg`)
    this.setFullCircle()
  }

  @Watch('radius')
  onRadiusChange (newValue?: number): void {
    this.hostElement.style.setProperty('--mds-radial-menu-radius', `${newValue}rem`)
  }

  @Watch('size')
  onSizeChange (): void {
    this.setItemSize()
  }

  @Watch('opened')
  onOpenedChange (newValue?: boolean): void {
    if (newValue === false) {
      this.opened = undefined
    }
  }

  render () {
    return (
      <Host>
        <mds-button
          class={clsx('menu-button', this.interaction !== 'click' && 'menu-button--hidden')}
          icon={this.opened ? miBaselineClose : this.icon }
          tone={this.tone}
          variant={this.variant}
          size={this.size}
          onClick={this.toggleMenu}
        ></mds-button>
        <div class="radial-menu" part="radial-menu">
          <slot name="item"></slot>
        </div>
        <div class="disc"></div>
      </Host>
    )
  }
}
