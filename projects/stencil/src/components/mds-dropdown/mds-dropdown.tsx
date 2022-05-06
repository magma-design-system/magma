import { Component, Host, h, Element, Prop } from '@stencil/core'
import { arrow, autoPlacement, autoUpdate, computePosition, flip, shift } from '@floating-ui/dom'
import { FloatingUIPlacement, FloatingUIStrategy } from '../../types/floating-ui'
import arrowSvg from './assets/arrow.svg'

@Component({
  tag: 'mds-dropdown',
  styleUrl: 'mds-dropdown.css',
  shadow: true,
})
export class MdsDropdown {

  private caller: HTMLElement
  private arrowElement: HTMLElement
  @Element() private host: HTMLMdsDropdownElement

  /**
   * If set, the component will have an arrow pointing to the caller.
   */
  @Prop() readonly arrow? = true

  /**
   * If set, the component will be placed automatically near it's caller.
   */
  @Prop() readonly autoPlacement? = false

  // TODO: check if ::backdrop works
  // @Prop() readonly background? = false

  /**
   * Specifies the placement of the component if no space is available where it is placed.
   */
  @Prop() readonly flip? = false

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop() readonly placement?: FloatingUIPlacement = 'bottom'

  /**
   * If set, the component will be kept inside the viewport.
   */
  @Prop() readonly shift? = true

  /**
   * Sets the CSS position strategy of the component.
   */
  @Prop() readonly strategy?: FloatingUIStrategy = 'fixed'

  /**
   * Specifies the visibility of the component.
   */
  @Prop({ mutable: true, reflect: true }) visible = false

  private callerOnClick = ():void => {
    console.log('callerOnClick')

    if (this.visible) {
      this.visible = false
      return
    }
    this.visible = true
    this.updatePosition()
  }

  private updatePosition = ():void => {
    const middleware = []
    if (this.autoPlacement) {
      middleware.push(autoPlacement())
    }

    if (!this.autoPlacement && this.flip) {
      middleware.push(flip({ padding: 8 }))
    }

    if (this.shift) {
      middleware.push(shift())
    }

    if (this.arrow) {
      middleware.push(arrow({
        element: this.arrowElement,
      }))
    }

    computePosition(this.caller, this.host, {
      middleware,
      placement: this.placement,
      strategy: this.strategy,
    }).then(({ x, y }) => {
      Object.assign(this.host.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
  }

  componentDidLoad ():void {
    this.arrowElement = this.host.querySelector('.arrow')

    console.log(this.arrowElement)
    this.caller = document.querySelector(`[for='${this.host.getAttribute('id')}']`)
    this.caller.addEventListener('click', this.callerOnClick.bind(this))
  }

  componentDidUpdate (): void {
    console.log('componentDidUpdate')
  }

  componentDidRender (): void {
    autoUpdate(this.caller, this.host, this.updatePosition)
  }

  render () {
    return (
      <Host>
        <div class="arrow" innerHTML={arrowSvg}/>
        <slot/>
      </Host>
    )
  }
}
