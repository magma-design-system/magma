import { Component, Element, Event, EventEmitter, Host, Listen, Prop, h, Watch } from '@stencil/core'
import { arrow, autoPlacement, autoUpdate, computePosition, flip, MiddlewareData, offset, shift } from '@floating-ui/dom'
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui'
import arrowSvg from './assets/arrow.svg'
import { setAttributeIfEmpty, hashValue } from '@common/aria'
import { KeyboardManager } from '@common/keyboard-manager'

@Component({
  tag: 'mds-dropdown',
  styleUrl: 'mds-dropdown.css',
  shadow: true,
})
export class MdsDropdown {

  private arrowEl: HTMLElement
  private backdropBackgroundVisible = 'rgba(var(--magma-backdrop-color, 0 0 0) / var(--magma-backdrop-opacity, 0.1))'
  private backdropBackgroundHidden = 'rgba(var(--magma-backdrop-color, 0 0 0) / 0)'
  private backdropDuration = 2000
  private backdropEl: HTMLElement
  private backdropId = 'mds-dropdown-backdrop'
  private backdropTimer: NodeJS.Timeout
  private caller: HTMLElement
  private cleanupAutoUpdate: () => void
  private km = new KeyboardManager()

  @Element() private host: HTMLMdsDropdownElement

  /**
   * If set, the component will have an arrow pointing to the caller.
   */
  @Prop() readonly arrow?: boolean = true

  /**
   * Sets the distance between arrow and dropdown margins.
   */
  @Prop() readonly arrowPadding?: number = 24

  /**
   * If set, the component will be placed automatically near it's caller.
   */
  @Prop() readonly autoPlacement?: boolean = false

  /**
   * Specifies if the component has a backdrop background
   */
  @Prop() readonly backdrop?: boolean = false

  /**
   * Specifies the placement of the component if no space is available where it is placed.
   */
  @Prop() readonly flip?: boolean = false

  /**
   * Specifies the id of the caller element.
   */
  @Prop() readonly target!: string

  /**
   * Sets distance between the dropdown and the caller.
   */
  @Prop() readonly offset?: number = 24

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop() readonly placement?: FloatingUIPlacement = 'bottom'

  /**
   * If set, the component will be kept inside the viewport.
   */
  @Prop() readonly shift?: boolean = true

  /**
   * Sets a safe area distance between the dropdown and the viewport.
   */
  @Prop() readonly shiftPadding?: number = 24

  /**
   * If set, the component will follow the caller smoothly, visible when the page scrolls.
   */
  @Prop() readonly smooth?: boolean = true

  /**
   * Sets the CSS position strategy of the component.
   */
  @Prop() readonly strategy?: FloatingUIStrategy = 'fixed'

  /**
   * Specifies the visibility of the component.
   */
  @Prop({ mutable: true, reflect: true }) visible?: boolean = false

  /**
   * Specifies the visibility of the component.
   */
  @Prop() readonly zIndex?: number = 1000

  /**
   * Emits when a modal is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsDropdownVisible' }) visibleEvent: EventEmitter<void>

  private handleCloseDropdown = (e:Event = null): void => {
    if (!this.visible) {
      return
    }

    if (!this.host.contains(e.target as HTMLElement) && e.target as HTMLElement !== this.caller) {
      this.visibleEvent.emit()
    }
  }

  @Listen('mdsDropdownVisible', { target: 'document' })
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
    if (!this.backdropEl) {
      this.backdropEl = document.createElement('div')
      this.backdropEl.style.backgroundColor = this.backdropBackgroundHidden
      this.backdropEl.className = this.backdropId
      this.backdropEl.style.inset = '0'
      this.backdropEl.style.pointerEvents = 'none'
      this.backdropEl.style.position = 'fixed'
      this.backdropEl.style.transition = `background-color ${this.backdropDuration / 10000}s ease-out`
      this.backdropEl.style.zIndex = (this.zIndex - 1).toString()
      document.body.appendChild(this.backdropEl)
    }

    clearTimeout(this.backdropTimer)
    this.backdropTimer = setTimeout(() => {
      this.backdropEl.style.backgroundColor = this.backdropBackgroundVisible
    }, 1)
  }

  private detachBackdrop (): void {
    if (!this.backdropEl) {
      return
    }
    this.backdropEl.style.backgroundColor = 'transparent'
    clearTimeout(this.backdropTimer)
    this.backdropTimer = setTimeout(() => {
      this.backdropEl.remove()
      this.backdropEl = null
    }, this.backdropDuration)
  }

  private callerOnClick = ():void => {
    this.handleVisibility()
  }

  private arrowInset = (middleware: MiddlewareData, arrowPosition: string): { bottom?: string, left?: string, right?: string, top?: string } => {
    const { arrow } = middleware
    const inset = { bottom:'', left: '', right: '', top: '' }

    if (arrow === undefined) {
      return {}
    }

    switch (arrowPosition) {
    case 'bottom':
      inset.left = arrow.x !== null ? `${arrow.x}px` : ''
      inset.top = '100%'
      break
    case 'left':
      inset.right = '100%'
      inset.top = arrow.y !== null ? `${arrow.y}px` : ''
      break
    case 'right':
      inset.left = '100%'
      inset.top = arrow.y !== null ? `${arrow.y}px` : ''
      break
    case 'top':
      inset.left = arrow.x !== null ? `${arrow.x}px` : ''
      inset.top = null
      break
    default:
      break
    }
    return inset
  }

  private arrowTransform = (arrowPosition: string): { transform: string } => {
    let transformProps = this.arrow && this.visible ? 'scale(1)' : 'scale(0)'
    switch (arrowPosition) {
    case 'bottom':
      transformProps = `rotate(180deg) ${transformProps} translate(0, -100%)`
      break
    case 'left':
      transformProps = `rotate(-90deg) ${transformProps} translate(50%, -50%)`
      break
    case 'right':
      transformProps = `rotate(90deg) ${transformProps} translate(-50%, -50%)`
      break
    case 'top':
      transformProps = `rotate(0deg) ${transformProps} translate(0, 0)`
      break
    default:
      break
    }
    return { transform: transformProps }
  }

  private arrowTransformOrigin = (arrowPosition: string): { transformOrigin: string } => {
    switch (arrowPosition) {
    case 'bottom':
      return { transformOrigin: 'center top' }
    case 'left':
      return { transformOrigin: 'right center' }
    case 'right':
      return { transformOrigin: 'left center' }
    case 'top':
      return { transformOrigin: 'center bottom' }
    default:
      return { transformOrigin: 'center top' }
    }
  }

  private updatePosition = ():void => {
    if (!this.caller) return

    const middleware = []
    const config: { padding?: number } = {}

    if (this.shiftPadding) {
      config.padding = this.shiftPadding
    }

    if (this.autoPlacement) {
      middleware.push(autoPlacement())
    }

    if (this.offset) {
      middleware.push(offset(this.offset))
    }

    if (!this.autoPlacement && this.flip) {
      middleware.push(flip(config))
    }

    if (this.shift) {
      middleware.push(shift(config))
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
    }).then(({ x, y, placement, middlewareData }) => {

      Object.assign(this.host.style, {
        left: `${x}px`,
        top: `${y}px`,
      })

      const arrowStyle = {}
      const arrowPosition = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]]

      Object.assign(arrowStyle, this.arrowTransform(arrowPosition))
      Object.assign(arrowStyle, this.arrowInset(middlewareData, arrowPosition))
      Object.assign(arrowStyle, this.arrowTransformOrigin(arrowPosition))
      Object.assign(this.arrowEl.style, arrowStyle)
    })
  }

  @Watch('arrow')
  arrowChanged (): void {
    this.updatePosition()
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
    if (!this.visible) {
      return
    }
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
    this.updatePosition()
    if (!this.backdrop) {
      return
    }
    if (newValue) {
      this.attachBackdrop()
      return
    }
    this.detachBackdrop()
  }

  @Watch('zIndex')
  zIndexChanged (newValue: number): void {
    this.host.style.setProperty('z-index', newValue.toString())
  }

  componentWillLoad (): void {
    Array.from(document.getElementsByClassName(this.backdropId)).forEach((element: HTMLElement) => {
      element.remove()
    })
    this.zIndexChanged(this.zIndex)
  }

  private setAriaAttributes (): void {
    const hostId = setAttributeIfEmpty(this.host, 'id', hashValue(this.target))
    setAttributeIfEmpty(this.caller, 'aria-haspopup', 'true')
    setAttributeIfEmpty(this.caller, 'aria-controls', hostId)
    setAttributeIfEmpty(this.host, 'role', 'menu')
    setAttributeIfEmpty(this.host, 'aria-labelledby', this.target)
  }

  componentDidLoad (): void {
    document.addEventListener('click', this.handleCloseDropdown)
    this.arrowEl = this.host.shadowRoot.querySelector('.arrow')
    this.caller = document.getElementById(this.target)

    this.setAriaAttributes()

    if (!this.caller) {
      return
    }

    this.caller.addEventListener('click', this.callerOnClick.bind(this))
    this.km.addElement(this.host)
    this.km.attachEscapeBehavior(() => this.handleVisibility(false))

    this.backdropChanged(this.backdrop)
    this.updatePosition()

    if (!this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate = autoUpdate(this.caller, this.host, this.updatePosition)
    }
  }

  disconnectedCallback (): void {
    this.km.detachEscapeBehavior()
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
