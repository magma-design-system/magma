import { Component, Host, Prop, Element, h, Watch } from '@stencil/core'
import { ButtonSizeType } from '@type/button'
import { Direction } from './meta/types'

@Component({
  tag: 'mds-radial-menu',
  styleUrl: 'mds-radial-menu.css',
  shadow: true,
})
export class MdsRadialMenu {
  @Element() private hostElement: HTMLMdsCardHeaderElement

  @Prop({ reflect: true }) readonly angleStart?: number

  @Prop({ reflect: true }) readonly angleEnd?: number

  @Prop({ reflect: true }) readonly radiusLength?: number

  @Prop({ reflect: true }) readonly direction?: Direction

  @Prop({ mutable: true, reflect: true }) opened?: boolean

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
      // TODO index dovrebbe partire da 0 o 1 ?
      // const i = index + 1
      item.style.setProperty('--mds-radial-menu-item-index', index.toString())
    })
  }

  // componentWillLoad (): void {
  //   this.onOpenedChange(this.opened)
  // }

  componentDidLoad (): void {
    this.items = this.hostElement.querySelectorAll(':scope > [slot="item"]')
    this.setItemSize()
    this.setItemIndex()

    this.hostElement.style.setProperty('--mds-radial-menu-nth-siblings', this.items.length.toString())

    this.onOpenedChange(this.opened)
  }

  @Watch('angleStart')
  onAngleStartChange (newValue?: number): void {
    this.hostElement.style.setProperty('--mds-radial-menu-angle-start', `${newValue}deg`)
  }

  @Watch('angleEnd')
  onAngleEndChange (newValue?: number): void {
    this.hostElement.style.setProperty('--mds-radial-menu-angle-end', `${newValue}deg`)
  }

  @Watch('radiusLength')
  onRadiusLengthChange (newValue?: number): void {
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
          class='menu-button'
          icon='mi/round/menu'
          tone='weak'
          variant='dark'
          size={this.size}
          onClick={this.toggleMenu}
        ></mds-button>
        <div class="radial-menu" part="radial-menu">
          <slot name="item"></slot>
        </div>
      </Host>
    )
  }
}
