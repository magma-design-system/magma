import { setAttributeIfEmpty } from '@common/aria'
import { KeyboardManager } from '@common/keyboard-manager'
import { cssDurationToMilliseconds } from '@common/unit'
import { Middleware, MiddlewareData, arrow, autoPlacement, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core'
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui'
import arrowSvg from './assets/arrow.svg'
import { MdsDropdownEventDetail } from './meta/event-detail'
import { DropdownInteractionType } from './meta/types'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot, elements will be shown when the component is triggered.
 */

@Component({
  tag: 'mds-dropdown',
  styleUrl: 'mds-dropdown.css',
  shadow: true,
})
export class MdsDropdown {
  private readonly backdropBackgroundVisible = 'rgba(var(--magma-backdrop-color, 0 0 0) / var(--magma-backdrop-opacity, 0.1))'
  private readonly backdropBackgroundHidden = 'rgba(var(--magma-backdrop-color, 0 0 0) / 0)'
  private readonly backdropId = 'mds-dropdown-backdrop'
  private readonly km = new KeyboardManager()

  private arrowEl: HTMLElement
  private cssBackdropDuration: string
  private cssMouseOverDelayDuration: string
  private cssBackdropZIndex: string
  private backdropEl: HTMLElement
  private backdropTimer: NodeJS.Timeout
  private mouseoverTimer: NodeJS.Timeout
  private caller: HTMLElement
  private cleanupAutoUpdate: () => void
  private updatePropsCssCalled = false

  @Element() private readonly host: HTMLMdsDropdownElement

  /**
   * If set, the component will have an arrow pointing to the caller.
   */
  @Prop() readonly arrow: boolean = true

  /**
   * Sets the distance between arrow and dropdown margins.
   */
  @Prop() readonly arrowPadding: number = 24

  /**
   * If set, the component will be placed automatically near it's caller.
   */
  @Prop() readonly autoPlacement: boolean = false

  /**
   * Specifies if the component has a backdrop background
   */
  @Prop() readonly backdrop: boolean = false

  /**
   * Specifies the placement of the component if no space is available where it is placed.
   */
  @Prop() readonly flip: boolean = false

  /**
   * Specifies if the component is triggered from the caller on mouseover or click event
   */
  @Prop({ reflect: true }) readonly interaction?: DropdownInteractionType = 'click'

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly target!: string

  /**
   * Sets distance between the dropdown and the caller.
   */
  @Prop() readonly offset: number = 24

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop() readonly placement: FloatingUIPlacement = 'bottom'

  /**
   * If set, the component will be kept inside the viewport.
   */
  @Prop() readonly shift: boolean = true

  /**
   * Sets a safe area distance between the dropdown and the viewport.
   */
  @Prop() readonly shiftPadding: number = 24

  /**
   * If set, the component will follow the caller smoothly, visible when the page scrolls.
   */
  @Prop() readonly smooth: boolean = true

  /**
   * Sets the CSS position strategy of the component.
   */
  @Prop() readonly strategy: FloatingUIStrategy = 'fixed'

  /**
   * Specifies the visibility of the component.
   */
  @Prop({ mutable: true, reflect: true }) visible = false

  /**
   * Specifies the visibility of the component.
   */
  @Prop() readonly zIndex: number

  /**
   * Emits when a modal is visible
   */
  @Event({ eventName: 'mdsDropdownVisible' }) visibleEvent: EventEmitter<MdsDropdownEventDetail>

  /**
   * Emits when a modal is hidden
   */
  @Event({ eventName: 'mdsDropdownHide' }) hiddenEvent: EventEmitter<MdsDropdownEventDetail>

  /**
   * Emits when a modal is visible or hidden
   */
  @Event({ eventName: 'mdsDropdownChange' }) changedEvent: EventEmitter<MdsDropdownEventDetail>

  private readonly handleCloseDropdown = (e: Event): void => {
    if (!this.host.contains(e.target as HTMLElement) && e.target as HTMLElement !== this.caller) {
      this.visible = false
    }
  }

  private attachBackdrop (): void {
    if (!this.backdropEl) {
      this.backdropEl = document.createElement('div')
      this.backdropEl.className = this.backdropId
      this.backdropEl.style.inset = '0'
      this.backdropEl.style.pointerEvents = 'none'
      this.backdropEl.style.position = 'fixed'
      this.backdropEl.style.transition = `background-color ${this.cssBackdropDuration} ease-out`
      this.backdropEl.style.zIndex = this.cssBackdropZIndex
    }
    this.backdropEl.style.backgroundColor = this.backdropBackgroundHidden
    document.body.appendChild(this.backdropEl)

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
    }, cssDurationToMilliseconds(this.cssBackdropDuration))
  }

  private readonly callerOnClick = (): void => {
    this.visible = !this.visible
  }

  private readonly callerOnMouseOver = (): void => {
    this.mouseoverTimer = setTimeout(() => {
      clearTimeout(this.mouseoverTimer)
      this.visible = true
    }, cssDurationToMilliseconds(this.cssMouseOverDelayDuration))
  }

  private readonly closeDropdownMouseLeave = (): void => {
    this.visible = false
    this.host.removeEventListener('mouseleave', this.closeDropdownMouseLeave.bind(this))
    this.host.addEventListener('mouseover', this.handleCloseDropdownMouseLeave.bind(this))
  }

  private readonly handleCloseDropdownMouseLeave = (): void => {
    this.host.removeEventListener('mouseover', this.handleCloseDropdownMouseLeave.bind(this))
    this.host.addEventListener('mouseleave', this.closeDropdownMouseLeave.bind(this))
  }

  private readonly arrowInset = (middleware: MiddlewareData, arrowPosition: string): { bottom?: string, left?: string, right?: string, top?: string } => {
    const { arrow } = middleware
    const inset = { bottom: '', left: '', right: '', top: '' }

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
      inset.top = ''
      break
    default:
      break
    }
    return inset
  }

  private readonly arrowTransform = (arrowPosition: string): { transform: string } => {
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

  private readonly arrowTransformOrigin = (arrowPosition: string): { transformOrigin: string } => {
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

  private readonly updatePosition = (): void => {
    if (!this.caller) return

    console.info('update position')
    const middleware: Middleware[] = new Array<Middleware>()
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

      if (arrowPosition) {
        Object.assign(arrowStyle, this.arrowTransform(arrowPosition))
        Object.assign(arrowStyle, this.arrowInset(middlewareData, arrowPosition))
        Object.assign(arrowStyle, this.arrowTransformOrigin(arrowPosition))
        Object.assign(this.arrowEl.style, arrowStyle)
      }
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

  @Watch('target')
  targetChanged (): void {
    if (!this.target) return

    this.arrowEl = this.host.shadowRoot?.querySelector('.arrow') as HTMLElement

    // search caller in document or rootNode of host (if target is in shadowDOM)
    const caller = this.host.parentElement?.shadowRoot?.querySelector(this.target) as HTMLElement ??
    (this.host.getRootNode() as HTMLElement).querySelector(this.target) as HTMLElement

    if (!caller) {
      throw Error(`Target not found: ${this.target}`)
    }

    this.caller = caller
    this.setAriaAttributes()

    this.setInteractionBehaviour()

    this.km.addElement(this.host)
    this.km.attachEscapeBehavior(() => this.visibleChanged(false))
  }

  @Watch('visible')
  visibleChanged (newValue: boolean): void {
    this.changedEvent.emit({ caller: this.caller, visible: newValue })
    if (newValue) {
      this.updateCSSCustomProps()
      document.addEventListener('click', this.handleCloseDropdown)
      if (!this.cleanupAutoUpdate) {
        this.cleanupAutoUpdate = autoUpdate(this.caller, this.host, this.updatePosition)
      }
      this.visibleEvent.emit({ caller: this.caller, visible: true })
      this.attachBackdrop()
      return
    }
    document.removeEventListener('click', this.handleCloseDropdown)
    this.cleanupAutoUpdate()
    this.detachBackdrop()
    this.hiddenEvent.emit({ caller: this.caller, visible: false })
  }

  private readonly updateCSSCustomProps = (): void => {
    if (!this.updatePropsCssCalled && typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.host)
    this.cssBackdropDuration = elementStyles.getPropertyValue('--mds-dropdown-backdrop-duration')
    this.cssBackdropZIndex = elementStyles.getPropertyValue('--mds-dropdown-backdrop-z-index')
    this.cssMouseOverDelayDuration = elementStyles.getPropertyValue('--mds-dropdown-mouseover-delay')
    this.updatePropsCssCalled = true
  }

  componentWillLoad (): void {
    Array.from(document.getElementsByClassName(this.backdropId)).forEach((element: HTMLElement) => {
      element.remove()
    })
  }

  private setAriaAttributes (): void {
    setAttributeIfEmpty(this.caller, 'aria-haspopup', 'true')
    setAttributeIfEmpty(this.caller, 'aria-controls', this.target)
    setAttributeIfEmpty(this.host, 'role', 'menu')
    setAttributeIfEmpty(this.host, 'aria-labelledby', this.target)
  }

  private readonly setInteractionBehaviour = (): void => {
    if (this.interaction === 'none') {
      return
    }

    if (this.interaction === 'click') {
      this.caller.addEventListener('click', this.callerOnClick.bind(this))
    }

    if (this.interaction === 'mouseover') {
      this.caller.addEventListener('mouseover', this.callerOnMouseOver.bind(this))
      this.host.addEventListener('mouseover', this.handleCloseDropdownMouseLeave.bind(this))
    }
  }

  componentDidLoad (): void {
    /**
   * When binding values in frameworks such as Angular
   * it is possible for the value to be set after the Web Component
   * initializes but before the value watcher is set up in Stencil.
   * As a result, the watcher callback may not be fired.
   * We work around this by manually calling the watcher
   * callback when the component has loaded and the watcher
   * is configured.
   */
    this.targetChanged()
  }

  disconnectedCallback (): void {
    this.detachBackdrop()
    this.km.detachEscapeBehavior()
    this.cleanupAutoUpdate = () => { return }
  }

  render () {
    return (
      <Host
        style={{
          zIndex: `${this.zIndex}`,
        }}
      >
        <div class="arrow" innerHTML={arrowSvg} />
        <slot />
      </Host>
    )
  }
}
