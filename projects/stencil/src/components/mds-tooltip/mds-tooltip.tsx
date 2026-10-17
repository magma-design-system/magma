import { Component, Element, Host, Prop, h, Watch } from '@stencil/core';
import { FloatingUIPlacement, FloatingUIRelation, FloatingUIStrategy } from '@type/floating-ui';
import { TypographyTooltipType } from '@type/typography';
import arrowSvg from './assets/arrow.svg';
import { FloatingController, FloatingElement } from '@common/floating-controller';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-tooltip',
  styleUrl: 'mds-tooltip.css',
  shadow: true,
})
export class MdsTooltip implements FloatingElement {
  private caller: HTMLElement;
  private floatingController: FloatingController;

  @Element() host!: HTMLMdsTooltipElement;

  /**
   * @internal
   */
  @Prop() readonly hideArrow: boolean = false;

  /**
   * @internal
   */
  @Prop() arrowPadding: number = 4;

  /**
   * Pins the component to `placement`: without it, the component moves to another side of the
   * caller when `placement` has no room.
   */
  @Prop({ reflect: true }) readonly disableAutoPlacement: boolean = false;

  /**
   * With `disableAutoPlacement`, moves the component to the opposite side of the caller when
   * `placement` has no room. Auto-placement, the default, already does it.
   */
  @Prop() readonly flip: boolean = false;

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop({ reflect: true }) readonly target!: string;

  /**
   * Sets distance between the tooltip and the caller.
   */
  @Prop() readonly offset: number = 12;

  /**
   * Specifies where the component should be placed relative to the caller: the side it takes
   * whenever it has room there.
   */
  @Prop({ reflect: true }) readonly placement: FloatingUIPlacement = 'top';

  /**
   * Sets what the tooltip is to its caller: its `description` (`aria-describedby`), or its
   * `label` (`aria-labelledby`), when the tooltip holds the only visible name of the caller, as on
   * an icon-only button.
   */
  @Prop({ reflect: true }) readonly relation: FloatingUIRelation = 'description';

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyTooltipType = 'tip';

  /**
   * If set, the component will not be kept inside the viewport.
   */
  @Prop() readonly disableShift: boolean = false;

  /**
   * Sets a safe area distance between the tooltip and the viewport.
   */
  @Prop() readonly shiftPadding: number = 12;

  /**
   * Sets the CSS position strategy of the component.
   */
  @Prop({ reflect: true }) readonly strategy: FloatingUIStrategy = 'fixed';

  /**
   * Specifies the visibility of the component.
   */
  @Prop({ mutable: true, reflect: true }) visible = false;

  private readonly handleVisibility = (visibility: boolean): void => {
    this.visible = visibility;
  };

  @Watch('hideArrow')
  hideArrowChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('disableAutoPlacement')
  disableAutoPlacementChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('flip')
  flipChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('offset')
  offsetChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('placement')
  placementChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('disableShift')
  disableShiftChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('shiftPadding')
  shiftPaddingChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('strategy')
  strategyChanged(): void {
    this.floatingController.updatePosition();
  }

  @Watch('relation')
  relationChanged(): void {
    this.floatingController?.rewire();
  }

  @Watch('visible')
  visibleChanged(newValue: boolean): void {
    this.floatingController.updatePosition();
    if (newValue) {
      this.floatingController.updatePosition();
      return;
    }
    this.floatingController.dismiss();
  }

  @Watch('target')
  targetChanged(): void {
    if ((this.target ?? '') === '') return;

    const caller = this.floatingController?.updateCaller(this.target);
    if (!caller) return;
    this.caller = caller;
    this.caller.addEventListener('mouseleave', this.handleVisibility.bind(this, false));
    this.caller.addEventListener('mouseenter', this.handleVisibility.bind(this, true));
  }

  componentDidLoad(): void {
    const arrow = this.host.shadowRoot?.querySelector('.arrow') as HTMLElement;
    this.floatingController = new FloatingController(this.host, arrow, 'tooltip');
    this.targetChanged();

    // The watcher does not fire for the initial value: a tooltip that mounts with
    // `visible` set would never be positioned.
    if (this.visible) {
      this.visibleChanged(true);
    }
  }

  disconnectedCallback(): void {
    this.floatingController.dismiss();
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div class="arrow" innerHTML={arrowSvg} />
        <mds-text class="text" typography={this.typography} part="text">
          <slot />
        </mds-text>
      </Host>
    );
  }
}
