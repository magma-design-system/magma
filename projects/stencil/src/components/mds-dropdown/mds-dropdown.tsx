import { Component, Host, h, Element, Prop } from '@stencil/core'
import { computePosition, autoUpdate, autoPlacement, flip, shift, offset } from '@floating-ui/dom'
import { FloatingUIPlacement, FloatingUIStrategy } from '../../types/floating-ui'


@Component({
  tag: 'mds-dropdown',
  styleUrl: 'mds-dropdown.css',
  shadow: true,
})
export class MdsDropdown {

  private caller: HTMLElement
  @Element() private host: HTMLMdsDropdownElement

  @Prop() readonly placement?: FloatingUIPlacement = 'bottom'
  @Prop() readonly strategy?: FloatingUIStrategy = 'fixed'
  @Prop() readonly autoPlacement? = false
  @Prop() readonly background? = false
  @Prop() readonly flip? = false
  @Prop() readonly shift? = true
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
    this.caller = document.querySelector(`[for='${this.host.getAttribute('id')}']`)
    this.caller.addEventListener('click', this.callerOnClick.bind(this))
  }

  componentDidRender (): void {
    autoUpdate(this.caller, this.host, this.updatePosition)
  }

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }
}
