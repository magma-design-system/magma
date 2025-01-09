import { Component, Element, Host, Prop, h, Watch } from '@stencil/core'
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui'
import { TypographyTooltipType } from '@type/typography'
import arrowSvg from './assets/arrow.svg'
import { FloatingController, FloatingElement } from '@common/floating-controller'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-tooltip',
  styleUrl: 'mds-tooltip.css',
  shadow: true,
})
export class MdsTooltip implements FloatingElement {

  private caller: HTMLElement
  private floatingController: FloatingController

  @Element() host!: HTMLMdsTooltipElement

  /**
   * @internal
   */
  @Prop() readonly arrow: boolean = true

  /**
   * @internal
   */
  @Prop() arrowPadding: number = 4

  /**
   * If set, the component will be placed automatically near it's caller.
   */
  @Prop({ reflect: true }) readonly autoPlacement: boolean = true

  /**
   * Specifies the placement of the component if no space is available where it is placed.
   */
  @Prop() readonly flip: boolean = false

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop({ reflect: true }) readonly target!: string

  /**
   * Sets distance between the tooltip and the caller.
   */
  @Prop() readonly offset: number = 12

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop({ reflect: true }) readonly placement: FloatingUIPlacement = 'top'

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyTooltipType = 'tip'

  /**
   * If set, the component will be kept inside the viewport.
   */
  @Prop() readonly shift: boolean = true

  /**
   * Sets a safe area distance between the tooltip and the viewport.
   */
  @Prop() readonly shiftPadding: number = 12

  /**
   * Sets the CSS position strategy of the component.
   */
  @Prop({ reflect: true }) readonly strategy: FloatingUIStrategy = 'fixed'

  /**
   * Specifies the visibility of the component.
   */
  @Prop({ mutable: true, reflect: true }) visible = false

  private readonly handleVisibility = (visibility: boolean): void => {
    this.visible = visibility
  }

  @Watch('arrow')
  arrowChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('autoPlacement')
  autoPlacementChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('flip')
  flipChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('offset')
  offsetChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('placement')
  placementChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('shift')
  shiftChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('shiftPadding')
  shiftPaddingChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('strategy')
  strategyChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('visible')
  visibleChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('target')
  targetChanged (): void {
    if (!this.target) return

    this.caller = this.floatingController.updateCaller(this.target)
    this.caller.addEventListener('mouseleave', this.handleVisibility.bind(this, false))
    this.caller.addEventListener('mouseenter', this.handleVisibility.bind(this, true))
  }

  componentDidLoad (): void {
    const arrow = this.host.shadowRoot?.querySelector('.arrow') as HTMLElement
    this.floatingController = new FloatingController(this.host, arrow)
    this.targetChanged()
  }

  disconnectedCallback (): void {
    this.floatingController.dismiss()
  }

  render () {
    return (
      <Host>
        <div class="arrow" innerHTML={arrowSvg}/>
        <mds-text class="text" typography={this.typography} part="text">
          <slot/>
        </mds-text>
      </Host>
    )
  }
}
