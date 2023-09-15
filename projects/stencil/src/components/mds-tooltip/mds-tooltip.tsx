import { Component, Element, Host, Prop, h, Watch } from '@stencil/core'
import { arrow, autoPlacement, autoUpdate, computePosition, flip, Middleware, MiddlewareData, offset, shift } from '@floating-ui/dom'
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui'
import { TypographyTooltipType } from '@type/typography'
import arrowSvg from './assets/arrow.svg'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-tooltip',
  styleUrl: 'mds-tooltip.css',
  shadow: true,
})
export class MdsTooltip {

  private arrowEl: HTMLElement
  private caller: HTMLElement
  private cleanupAutoUpdate: () => void

  @Element() private host: HTMLMdsTooltipElement

  /**
   * If set, the component will have an arrow pointing to the caller.
   */
  @Prop() readonly arrow?: boolean = true

  /**
   * Sets the distance between arrow and tooltip margins.
   */
  private arrowPadding?: number = 4

  /**
   * If set, the component will be placed automatically near it's caller.
   */
  @Prop() readonly autoPlacement?: boolean = true

  /**
   * Specifies the placement of the component if no space is available where it is placed.
   */
  @Prop() readonly flip: boolean = false

  /**
   * Specifies the id of the caller element.
   */
  @Prop() readonly target!: string

  /**
   * Sets distance between the tooltip and the caller.
   */
  @Prop() readonly offset: number = 12

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop() readonly placement?: FloatingUIPlacement = 'top'

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyTooltipType = 'tip'

  /**
   * If set, the component will be kept inside the viewport.
   */
  @Prop() readonly shift?: boolean = true

  /**
   * Sets a safe area distance between the tooltip and the viewport.
   */
  @Prop() readonly shiftPadding: number = 12

  /**
   * Sets the CSS position strategy of the component.
   */
  @Prop() readonly strategy?: FloatingUIStrategy = 'fixed'

  /**
   * Specifies the visibility of the component.
   */
  @Prop({ mutable: true, reflect: true }) visible = false

  private handleVisibility = (visibility: boolean): void => {
    this.visible = visibility
    if (this.visible) this.updatePosition()
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
    const middleware = new Array<Middleware>()
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

      if (arrowPosition){
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

  @Watch('autoPlacement')
  autoPlacementChanged (): void {
    this.updatePosition()
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
  visibleChanged (): void {
    this.updatePosition()
  }

  componentDidRender (): void {
    this.arrowEl = this.host.shadowRoot?.querySelector('.arrow') as HTMLElement
    const caller = document.getElementById(this.target)
    if (caller) {
      this.caller = caller
      this.caller.addEventListener('mouseleave', this.handleVisibility.bind(this, false))
      this.caller.addEventListener('mouseenter', this.handleVisibility.bind(this, true))
    }
  }

  componentDidLoad (): void {
    if (!this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate = autoUpdate(this.caller, this.host, this.updatePosition)
    }
  }

  disconnectedCallback (): void {
    this.cleanupAutoUpdate = () => {return}
  }

  render () {
    return (
      <Host>
        <div class="arrow" innerHTML={arrowSvg}/>
        <mds-text class="text" typography={this.typography}>
          <slot/>
        </mds-text>
      </Host>
    )
  }
}
