import { KeyboardManager } from '@common/keyboard-manager'
import { cssDurationToMilliseconds } from '@common/unit'
import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  h,
} from '@stencil/core'
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui'
import arrowSvg from './assets/arrow.svg'
import { MdsDropdownEventDetail } from './meta/event-detail'
import { DropdownInteractionType } from './meta/types'
import { Backdrop, FloatingController, FloatingElement } from '@common/floating-controller'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot, elements will be shown when the component is triggered.
 */

@Component({
  tag: 'mds-dropdown',
  styleUrl: 'mds-dropdown.css',
  shadow: true,
})
export class MdsDropdown implements FloatingElement {
  private readonly km = new KeyboardManager()
  private cssMouseOverDelayDuration: string
  private mouseoverTimer: NodeJS.Timeout
  private caller: HTMLElement
  private readonly backdropController: Backdrop = new Backdrop()
  private floatingController: FloatingController

  @Element() readonly host!: HTMLMdsDropdownElement

  /**
   * If set, the component will have an arrow pointing to the caller.
   */
  @Prop({ reflect: true }) readonly arrow: boolean = true

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
  @Prop({ reflect: true }) readonly interaction: DropdownInteractionType = 'click'

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

  @Watch('arrow')
  arrowChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('arrowPadding')
  arrowPaddingChanged (): void {
    this.floatingController.updatePosition()

  }

  @Watch('autoPlacement')
  autoPlacementChanged (): void {
    this.floatingController.updatePosition()
  }

  @Watch('backdrop')
  backdropChanged (newValue: boolean): void {
    if (!this.visible) {
      return
    }
    if (newValue) {
      this.backdropController.attachBackdrop()
      return
    }
    this.backdropController.detachBackdrop()
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

  @Watch('target')
  targetChanged (): void {
    if (!this.target) return
    this.caller = this.floatingController.updateCaller(this.target)
    this.setInteractionBehaviour()
    this.km.addElement(this.host)
    this.km.attachEscapeBehavior(() => this.visibleChanged(false))
  }

  @Watch('visible')
  visibleChanged (newValue: boolean): void {
    this.changedEvent.emit({ caller: this.caller, visible: newValue })
    if (newValue) {
      document.addEventListener('click', this.handleCloseDropdown)
      this.floatingController.updatePosition()
      this.backdropController.attachBackdrop()
      this.visibleEvent.emit({ caller: this.caller, visible: true })
      return
    }
    this.floatingController.dismiss()
    this.backdropController.detachBackdrop()
    this.hiddenEvent.emit({ caller: this.caller, visible: false })
  }

  onClickTarget (): void {
    this.visible = !this.visible
  }

  onMouseOverTarget (): void {
    this.mouseoverTimer = setTimeout(() => {
      clearTimeout(this.mouseoverTimer)
      this.visible = true
    }, cssDurationToMilliseconds(this.cssMouseOverDelayDuration))
  }

  onMouseOutTarget (): void {
    clearTimeout(this.mouseoverTimer)
    this.mouseoverTimer = setTimeout(() => {
      clearTimeout(this.mouseoverTimer)
      this.visible = false
    }, cssDurationToMilliseconds(this.cssMouseOverDelayDuration))
  }

  private readonly updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.host)
    this.cssMouseOverDelayDuration = elementStyles.getPropertyValue(
      '--mds-dropdown-mouseover-delay',
    )
  }

  private readonly handleCloseDropdown = (e: Event): void => {
    if (e.type === 'mouseleave') {
      this.host.removeEventListener('mouseleave', this.handleCloseDropdown)
      this.caller.removeEventListener('mouseleave', this.handleCloseDropdown)
      this.visible = false
      return
    }
    if (!this.host.contains(e.target as HTMLElement) && e.target as HTMLElement !== this.caller) {
      this.visible = false
      document.removeEventListener('click', this.handleCloseDropdown)
    }
  }

  private readonly setInteractionBehaviour = (): void => {
    if (this.interaction === 'none') {
      return
    }

    if (this.interaction === 'click') {
      this.caller.addEventListener('click', this.onClickTarget.bind(this))
    }

    if (this.interaction === 'mouseover') {
      this.caller.addEventListener('mouseover', this.onMouseOverTarget.bind(this))
      this.caller.addEventListener('mouseout', this.onMouseOutTarget.bind(this))
      this.host.addEventListener('mouseover', this.handleCloseDropdownMouseLeave.bind(this))
    }
  }

  private readonly handleCloseDropdownMouseLeave = (): void => {
    clearTimeout(this.mouseoverTimer)
    this.host.removeEventListener('mouseover', this.handleCloseDropdownMouseLeave.bind(this))
    this.host.addEventListener('mouseleave', this.handleCloseDropdown.bind(this))
  }

  componentDidLoad (): void {
    const arrow = this.host.shadowRoot?.querySelector('.arrow') as HTMLElement
    /**
     * When binding values in frameworks such as Angular
     * it is possible for the value to be set after the Web Component
     * initializes but before the value watcher is set up in Stencil.
     * As a result, the watcher callback may not be fired.
     * We work around this by manually calling the watcher
     * callback when the component has loaded and the watcher
     * is configured.
     */
    this.floatingController = new FloatingController(this.host, arrow)
    this.updateCSSCustomProps()
    this.targetChanged()
  }

  disconnectedCallback (): void {
    this.backdropController.detachBackdrop()
    this.km.detachEscapeBehavior()
  }

  render () {
    return (
      <Host
        style={{
          zIndex: `${this.zIndex}`,
        }}
      >
        <div class="arrow" innerHTML={arrowSvg}/>
        <slot />
      </Host>
    )
  }
}
