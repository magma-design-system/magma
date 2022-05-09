import { Component, Element, Event, EventEmitter, Host, Listen, Prop, h, Watch } from '@stencil/core'
import { arrow, autoPlacement, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { FloatingUIPlacement, FloatingUIStrategy } from '../../types/floating-ui'
import arrowSvg from './assets/arrow.svg'

@Component({
  tag: 'mds-dropdown',
  styleUrl: 'mds-dropdown.css',
  shadow: true,
})
export class MdsDropdown {

  private arrowEl: HTMLElement
  private backdropDuration = 2000
  private backdropEl: HTMLElement
  private backdropTimer: NodeJS.Timeout
  private caller: HTMLElement
  private cleanupAutoUpdate: () => void

  @Element() private host: HTMLMdsDropdownElement

  /**
   * If set, the component will have an arrow pointing to the caller.
   */
  @Prop() readonly arrow? = true

  /**
   * Sets the distance between arrow and dropdown margins.
   */
  @Prop() readonly arrowPadding = 24

  /**
   * If set, the component will be placed automatically near it's caller.
   */
  @Prop() readonly autoPlacement? = false

  /**
   * Specifies if the component has a backdrop background
   */
  @Prop() readonly backdrop? = false

  /**
   * Specifies the placement of the component if no space is available where it is placed.
   */
  @Prop() readonly flip? = false

  /**
   * Sets distance between the dropdown and the caller.
   */
  @Prop() readonly offset = 24

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop() readonly placement?: FloatingUIPlacement = 'bottom'

  /**
   * If set, the component will be kept inside the viewport.
   */
  @Prop() readonly shift? = true

  /**
   * Sets a safe area distance between the dropdown and the body.
   */
  @Prop() readonly shiftPadding = 24

  /**
   * Sets the CSS position strategy of the component.
   */
  @Prop() readonly strategy?: FloatingUIStrategy = 'fixed'

  /**
   * Specifies the visibility of the component.
   */
  @Prop({ mutable: true, reflect: true }) visible = false

  /**
   * Emits when a modal is closed
   */
  @Event({ bubbles: true, composed: true }) closeDropdown: EventEmitter<void>

  private handleCloseDropdown = (e:Event = null): void => {
    if (!this.visible) {
      return
    }

    if (!this.host.contains(e.target as HTMLElement) && e.target as HTMLElement !== this.caller) {
      this.closeDropdown.emit()
    }
  }

  @Listen('closeDropdown', { target: 'document' })
  onCloseListener (): void {
    this.handleVisibility(false)
  }

  private handleVisibility = (visibility: boolean = null): void => {
    if (visibility !== null) {
      this.visible = visibility
      return
    }
    if (this.visible) {
      this.visible = false
      return
    }
    this.visible = true
    this.updatePosition()
  }

  private attachBackdrop (): void {
    this.backdropEl = document.createElement('div')
    this.backdropEl.style.backgroundColor = 'rgba(0, 0, 0, 0)'
    this.backdropEl.style.inset = '0'
    this.backdropEl.style.pointerEvents = 'none'
    this.backdropEl.style.position = 'fixed'
    this.backdropEl.style.transition = `background-color ${this.backdropDuration / 10000}s ease-out`
    this.backdropEl.style.zIndex = (Number(this.host.style.zIndex) - 1).toString()

    document.body.appendChild(this.backdropEl)

    clearTimeout(this.backdropTimer)
    this.backdropTimer = setTimeout(() => {
      this.backdropEl.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'
    }, 1)
  }

  private detachBackdrop (): void {
    this.backdropEl.style.backgroundColor = 'rgba(0, 0, 0, 0)'

    clearTimeout(this.backdropTimer)
    this.backdropTimer = setTimeout(() => {
      this.backdropEl.remove()
    }, this.backdropDuration)
  }

  private callerOnClick = ():void => {
    this.handleVisibility()
  }

  private updatePosition = ():void => {
    const middleware = []
    if (this.autoPlacement) {
      middleware.push(autoPlacement())
    }

    if (this.offset) {
      middleware.push(offset(this.offset))
    }

    if (!this.autoPlacement && this.flip) {
      middleware.push(flip({
        padding: this.shiftPadding,
      }))
    }

    if (this.shift) {
      middleware.push(shift({
        padding: this.shiftPadding,
      }))
    }

    if (this.arrow) {
      middleware.push(arrow({
        element: this.arrowEl,
        padding: this.arrowPadding,
      }))
    }

    computePosition(this.caller, this.host, {
      middleware,
      placement: this.placement,
      strategy: this.strategy,
    }).then(({ x, y, middlewareData }) => {
      Object.assign(this.host.style, {
        left: `${x}px`,
        top: `${y}px`,
      })

      const { arrow } = middlewareData
      Object.assign(this.arrowEl.style, {
        left: arrow.x !== null ? `${arrow.x}px` : '',
        top: arrow.y !== null ? `${arrow.y}px` : '',
      })
    })
  }

  @Watch('arrow')
  arrowChanged (newValue: boolean): void {
    if (newValue) {
      this.updatePosition()
    }
  }

  @Watch('arrowPadding')
  arrowPaddingChanged (): void {
    this.updatePosition()
  }

  @Watch('autoPlacement')
  autoPlacementChanged (): void {
    this.updatePosition()
  }

  @Watch('backdrop')
  backdropChanged (newValue: boolean): void {
    if (newValue) {
      this.attachBackdrop()
      return
    }
    this.detachBackdrop()
  }

  @Watch('flip')
  flipChanged (): void {
    this.updatePosition()
  }

  @Watch('offset')
  offsetChanged (): void {
    this.updatePosition()
  }

  @Watch('placement')
  placementChanged (): void {
    this.updatePosition()
  }

  @Watch('shift')
  shiftChanged (): void {
    this.updatePosition()
  }

  @Watch('shiftPadding')
  shiftPaddingChanged (): void {
    this.updatePosition()
  }

  @Watch('strategy')
  strategyChanged (): void {
    this.updatePosition()
  }

  @Watch('visible')
  visibleChanged (newValue: boolean): void {
    if (!this.backdrop) {
      return
    }
    if (newValue) {
      this.attachBackdrop()
      return
    }
    this.detachBackdrop()
  }

  componentDidLoad ():void {
    document.addEventListener('click', this.handleCloseDropdown)
    this.arrowEl = this.host.shadowRoot.querySelector('.arrow')
    this.caller = document.querySelector(`[for='${this.host.getAttribute('id')}']`)
    this.caller.addEventListener('click', this.callerOnClick.bind(this))
  }

  componentDidRender (): void {
    if (!this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate = autoUpdate(this.caller, this.host, this.updatePosition)
    }
  }

  disconnectedCallback (): void {
    this.cleanupAutoUpdate = null
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
