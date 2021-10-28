import { Component, Element, Host, h, Prop, State } from '@stencil/core'
import clsx from 'clsx'

import { TargetOffset, TooltipPosition } from './meta/interface'
import { TooltipPositionType } from './meta/types'

@Component({
  tag: 'mds-tooltip',
  styleUrl: 'mds-tooltip.css',
  shadow: true,
})
export class MdsTooltip {

  @Element() private element: HTMLMdsTooltipElement
  @State() visible = false
  @State() arrowPosition: TooltipPositionType
  private targetElement: HTMLElement

  /**
   * Specifies the delay when the tooltip will trigger
   */
  @Prop() readonly delay?: number = 1000

  /**
   * Specifies the id selector of the element will trigger the tooltip
   */
  @Prop() readonly for!: string

  /**
   * Specifies the position of the tooltip relative to the trigger element
   */
  @Prop() readonly position?: TooltipPositionType = 'top'

  componentWillLoad (): void {
    this.targetElement = document.getElementById(this.for)
    this.targetElement.addEventListener('mouseover', this.targetOnMouseOver.bind(this))
    this.targetElement.addEventListener('mouseout', this.targetOnMouseOut.bind(this))
    window.addEventListener('scroll', this.targetOnMouseOut.bind(this))
  }

  disconnectedCallback (): void {
    this.targetElement.removeEventListener('mouseover', this.targetOnMouseOver.bind(this))
    this.targetElement.removeEventListener('mouseout', this.targetOnMouseOut.bind(this))
    window.removeEventListener('scroll', this.targetOnMouseOut.bind(this))
  }

  private targetOffset = (): TargetOffset => {
    const rect = this.targetElement.getBoundingClientRect()
    return {
      height: rect.height,
      left: rect.left,
      top: rect.top,
      width: rect.width,
    }
  }

  private leftRightY = (): number => {
    if (this.targetOffset().height > this.element.offsetHeight) {
      return this.targetOffset().top + (Math.abs(this.targetOffset().height - (this.element.offsetHeight)) / 2)
    }
    return this.targetOffset().top - (Math.abs(this.targetOffset().height - (this.element.offsetHeight)) / 2)
  }

  private topBottomX = (): number => {
    if (this.targetOffset().width > this.element.offsetWidth) {
      return this.targetOffset().left + Math.abs(this.targetOffset().width - (this.element.offsetWidth)) / 2
    }
    return this.targetOffset().left - Math.abs(this.targetOffset().width - (this.element.offsetWidth)) / 2
  }

  private top = (): TooltipPosition => {
    return {
      x: this.topBottomX(),
      overflow: this.targetOffset().top < this.element.offsetHeight,
      y: this.targetOffset().top - this.element.offsetHeight,
    }
  }

  private bottom = (): TooltipPosition => {
    return {
      x: this.topBottomX(),
      overflow: this.element.offsetHeight + this.element.offsetTop > window.innerHeight,
      y: this.targetOffset().top + this.targetOffset().height,
    }
  }

  private right = (): TooltipPosition => {
    return {
      x: this.targetOffset().left + this.targetOffset().width,
      overflow: this.element.offsetLeft + this.element.offsetWidth > window.innerWidth,
      y: this.leftRightY(),
    }
  }

  private left = (): TooltipPosition => {
    return {
      x: this.targetOffset().left - this.element.offsetWidth,
      overflow: false,
      y: this.leftRightY(),
    }
  }

  private topPosition = (): void => {
    this.element.style.top = `${this.top().y}px`
    this.element.style.left = `${this.top().x}px`
  }

  private bottomPosition = (): void => {
    this.element.style.top = `${this.bottom().y}px`
    this.element.style.left = `${this.bottom().x}px`
  }

  private leftPosition = (): void => {
    this.element.style.top = `${this.left().y}px`
    this.element.style.left = `${this.left().x}px`
  }

  private rightPosition = (): void => {
    this.element.style.top = `${this.right().y}px`
    this.element.style.left = `${this.right().x}px`
  }

  private bestPosition = (): TooltipPositionType => {
    if (!this.top().overflow) {
      return 'top'
    }

    if (!this.right().overflow) {
      return 'right'
    }

    if (!this.bottom().overflow) {
      return 'bottom'
    }

    if (!this.left().overflow) {
      return 'left'
    }
  }

  private checkPosition = (): void => {
    this.arrowPosition = this.bestPosition()
    console.log('checkPosition', this.arrowPosition)

    switch (this.arrowPosition) {
    case 'top':
      this.topPosition()
      break
    case 'bottom':
      this.bottomPosition()
      break
    case 'right':
      this.rightPosition()
      break
    case 'left':
      this.leftPosition()
      break
    default:
      this.topPosition()
      break
    }
  }

  private targetOnMouseOver = (): void => {
    switch (this.position) {
    case 'top':
      this.topPosition()
      break
    case 'right':
      this.rightPosition()
      break
    case 'bottom':
      this.bottomPosition()
      break
    case 'left':
      this.leftPosition()
      break
    }

    window.setTimeout(() => {
      this.visible = true
    }, this.delay)
  }

  private targetOnMouseOut = (): void => {
    this.visible = false
  }

  render () {
    return (
      <Host class={clsx(
        `mds-tooltip--${this.position}`,
        this.visible && 'mds-tooltip--visible',
      )}>
        <div class="balloon">
          <mds-text typography="caption"><slot/></mds-text>
          <div class={clsx(
            'arrow',
            `arrow--${this.position}`,
          )}/>
        </div>
      </Host>
    )
  }
}
