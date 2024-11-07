import { Component, Element, Host, h, Prop, State } from '@stencil/core'
import { SnapType, ViewportType } from './meta/types'
import miBaselineArrowBack from '@icon/mi/baseline/arrow-back.svg'
import miBaselineArrowForward from '@icon/mi/baseline/arrow-forward.svg'
import clsx from 'clsx'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-horizontal-scroll',
  styleUrl: 'mds-horizontal-scroll.css',
  shadow: true,
})
export class MdsHorizontalScroll {

  @Element() private host: HTMLMdsHorizontalScrollElement
  private elements:Node[]
  private contents: HTMLElement
  private lastElementOffsetLeft: number
  @State() showForward = true
  @State() showBack = false

  /**
   * Specifies the viewport which will display navigation controls
   */
  @Prop({ reflect: true }) readonly controls?: ViewportType = 'desktop'

  /**
   * Specifies the box’s snap position as an alignment of its snap area
   */
  @Prop({ reflect: true }) readonly snap?: SnapType = 'start'

  /**
   * Shows the horizontal scrollbar to maximize accessibility
   */
  @Prop({ reflect: true }) readonly scrollbar?: boolean

  private updateElements = (): void => {
    this.elements = this.host.shadowRoot?.querySelectorAll('slot')[0]?.assignedNodes() as Node[]
  }

  private isInViewport = (element: HTMLElement): boolean => {
    if (!this.contents) {
      return false
    }
    const rect = element.getBoundingClientRect()
    const rectWrapper = this.contents.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= rectWrapper.height &&
      rect.right <= rectWrapper.width
    )
  }

  private checkNavigationButtons = (): void => {
    if (!this.elements) {
      throw Error('No elements slotted to the component')
    }
    this.showBack = true
    this.showForward = true
    this.elements.forEach((element: HTMLElement, index: number) => {

      if (index === 0 && this.isInViewport(element)) {
        this.showBack = false
      }

      if (this.elements.length - 1 === index && this.isInViewport(element)) {
        this.showForward = false
      }
    })
  }

  private moveBack = (): void => {
    if (!this.elements) {
      throw Error('No elements slotted to the component')
    }

    let firstIndex: number = 0
    let elFirstInViewport: HTMLElement | undefined
    let elLastInViewport: HTMLElement | undefined

    this.elements.forEach((element: HTMLElement, index: number) => {
      // element.style.backgroundColor = 'white'
      if (this.isInViewport(element)) {
        if (!elFirstInViewport) {
          firstIndex = index
          elFirstInViewport = element
        }
        elLastInViewport = element
      }
    })

    this.elements.forEach((element: HTMLElement, index: number) => {
      if (!this.isInViewport(element) && index === firstIndex - 1 && elFirstInViewport !== undefined && elLastInViewport !== undefined) {
        // element.style.backgroundColor = 'red'
        this.contents.scrollLeft = this.contents.scrollLeft + element.offsetLeft - elLastInViewport.offsetLeft
      }
    })
  }

  private moveForward = (): void => {

    if (!this.elements) {
      throw Error('No elements slotted to the component')
    }

    let isFirstOutside = true

    this.elements.forEach((element: HTMLElement) => {
      // element.style.backgroundColor = 'white'
      if (!this.isInViewport(element)) {
        if (element.offsetLeft > this.contents.scrollLeft && isFirstOutside) {
          isFirstOutside = false
          // element.style.backgroundColor = 'red'
          this.lastElementOffsetLeft = element.offsetLeft
          this.contents.scrollLeft = this.lastElementOffsetLeft
        }
      }
    })
  }

  componentDidLoad (): void {
    this.contents = this.host.shadowRoot?.querySelector('.contents') as HTMLElement
    this.contents.addEventListener('scrollend', this.checkNavigationButtons)
  }

  disconnectedCallback (): void {
    this.contents.removeEventListener('scrollend', this.checkNavigationButtons)
  }

  render () {
    return (
      <Host>
        <div class="contents" part="content">
          <slot onSlotchange={this.updateElements}></slot>
        </div>
        { this.controls !== 'none' && <mds-button onClick={this.moveBack} size="lg" class={clsx('navigation navigation--back', !this.showBack && 'navigation--disabled')} icon={ miBaselineArrowBack }></mds-button> }
        { this.controls !== 'none' && <mds-button onClick={this.moveForward} size="lg" class={clsx('navigation navigation--forward', !this.showForward && 'navigation--disabled')} icon={ miBaselineArrowForward }></mds-button> }
      </Host>
    )
  }
}
