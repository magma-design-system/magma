import {
  arrow,
  autoPlacement,
  autoUpdate,
  computePosition,
  flip,
  Middleware,
  MiddlewareData,
  offset,
  shift,
} from '@floating-ui/dom'
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui'
import { cssDurationToMilliseconds } from './unit'
import { setAttributeIfEmpty } from './aria'
import { HTMLStencilElement } from '@stencil/core/internal'

export interface FloatingElement extends PositionOptions {
  host: HTMLFloatingElement,
}

export interface HTMLFloatingElement extends HTMLStencilElement, PositionOptions {
  visible: boolean,
}

export interface PositionOptions {
  arrow: boolean;
  arrowPadding: number;
  autoPlacement: boolean;
  flip: boolean;
  offset: number;
  placement: FloatingUIPlacement;
  shift: boolean;
  shiftPadding: number;
  strategy: FloatingUIStrategy;
}

export class FloatingController {
  private _caller: HTMLElement
  private readonly _host: HTMLFloatingElement
  arrowEl: HTMLElement | undefined

  private cleanupAutoUpdate: () => void

  constructor (host: HTMLFloatingElement, arrowEl?: HTMLElement) {
    this._host = host
    this.arrowEl = arrowEl
  }

  updateCaller (target: string): HTMLElement {
    // search caller in document or rootNode of host (if target is in shadowDOM)
    const caller = (this._host.parentElement?.shadowRoot?.querySelector(target) as HTMLElement) ??
      ((this._host.getRootNode() as HTMLElement).querySelector(target) as HTMLElement)

    if (!caller) {
      throw Error(`Target not found: ${target}`)
    }

    this._caller = caller

    setAttributeIfEmpty(this._caller, 'aria-haspopup', 'true')
    setAttributeIfEmpty(this._caller, 'aria-controls', target)
    setAttributeIfEmpty(this._host, 'role', 'menu')
    setAttributeIfEmpty(this._host, 'aria-labelledby', target)
    return caller
  }

  private readonly arrowInset = (
    middleware: MiddlewareData,
    arrowPosition: string,
  ): { bottom?: string; left?: string; right?: string; top?: string } => {
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

  private readonly arrowTransform = (
    arrowPosition: string,
  ): { transform: string } => {
    let transformProps = this._host.arrow && this._host.visible ? 'scale(1)' : 'scale(0)'
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

  private readonly arrowTransformOrigin = (
    arrowPosition: string,
  ): { transformOrigin: string } => {
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

  private readonly calculatePosition = (): void => {
    if (!this._caller) return

    const middleware: Middleware[] = new Array<Middleware>()
    const config: { padding?: number } = {}

    if (this._host.shiftPadding) {
      config.padding = this._host.shiftPadding
    }

    if (this._host.autoPlacement) {
      middleware.push(autoPlacement())
    }

    if (this._host.offset) {
      middleware.push(offset(this._host.offset))
    }

    if (!this._host.autoPlacement && this._host.flip) {
      middleware.push(flip(config))
    }

    if (this._host.shift) {
      middleware.push(shift(config))
    }

    if (this.arrowEl && this._host.arrow) {
      middleware.push(
        arrow({
          element: this.arrowEl,
          padding: this._host.arrowPadding,
        }),
      )
    }

    computePosition(this._caller, this._host, {
      middleware,
      placement: this._host.placement,
      strategy: this._host.strategy,
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(this._host.style, {
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

      if (arrowPosition && this.arrowEl) {
        Object.assign(arrowStyle, this.arrowTransform(arrowPosition))
        Object.assign(
          arrowStyle,
          this.arrowInset(middlewareData, arrowPosition),
        )
        Object.assign(arrowStyle, this.arrowTransformOrigin(arrowPosition))
        Object.assign(this.arrowEl.style, arrowStyle)
      }
    })
  }

  updatePosition (): void {
    if (this.cleanupAutoUpdate) this.cleanupAutoUpdate()
    this.cleanupAutoUpdate = autoUpdate(this._caller, this._host, this.calculatePosition)
  }

  dismiss (): void {
    this.cleanupAutoUpdate()
  }
}

export class Backdrop {
  private readonly defaultBackdropId = 'magma-backdrop'
  private readonly backdropBackgroundVisible = 'rgba(var(--magma-backdrop-color, 0 0 0) / var(--magma-backdrop-opacity, 0.1))'
  private readonly backdropBackgroundHidden = 'rgba(var(--magma-backdrop-color, 0 0 0) / 0)'

  private readonly backdropId: string
  private readonly cssBackdropZIndex: string
  private readonly cssBackdropDuration: string

  private backdropEl: HTMLElement
  private backdropTimer: NodeJS.Timeout

  constructor (backdropId?: string) {
    this.backdropId = backdropId ?? this.defaultBackdropId
    this.cssBackdropZIndex = `var(--${this.backdropId}-z-index, 4000)`
    this.cssBackdropDuration = `var(--${this.backdropId}-animation-duration, 300ms)`
  }

  attachBackdrop (): void {
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

  detachBackdrop (): void {
    if (!this.backdropEl) {
      return
    }
    this.backdropEl.style.backgroundColor = 'transparent'
    clearTimeout(this.backdropTimer)
    this.backdropTimer = setTimeout(() => {
      this.backdropEl.remove()
    }, cssDurationToMilliseconds(this.cssBackdropDuration))
  }
}
