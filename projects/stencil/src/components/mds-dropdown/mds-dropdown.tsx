import { Component, Host, h, Element, Prop } from '@stencil/core'
import { computePosition, autoPlacement, flip, shift } from '@floating-ui/dom'
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
  @Prop() readonly flip? = false
  @Prop() readonly shift? = false
  @Prop({ mutable: true, reflect: true }) visible = false

  private callerOnClick = ():void => {

    console.log('callerOnClick')

    this.visible = true

    const middleware = []
    if (this.autoPlacement) {
      middleware.push(autoPlacement())
    }

    if (!this.autoPlacement && this.flip) {
      middleware.push(flip())
    }

    if (this.shift) {
      middleware.push(shift())
    }

    computePosition(this.caller, this.host, {
      middleware,
      placement: this.placement,
      strategy: this.strategy,
    })
  }

  componentDidLoad ():void {
    this.caller = document.querySelector(`[for='${this.host.getAttribute('id')}']`)
    this.caller.addEventListener('click', this.callerOnClick.bind(this))
  }

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }
}
