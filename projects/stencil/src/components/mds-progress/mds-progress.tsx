import { Component, Element, Host, h, Prop, Watch, State } from '@stencil/core'
import { DirectionType } from './meta/types'
import { ThemeVariantType } from '@type/variant'
import { removeAttributesIf, ifAttribute } from '@common/aria'

@Component({
  tag: 'mds-progress',
  styleUrl: 'mds-progress.css',
  shadow: true,
})
export class MdsProgress {
  @Element() private element: HTMLMdsAccordionTimerElement
  @State() currentStep: string
  private stepsList = new Array<string>()

  /**
   * A value between 0 and 1 that rapresents the status progress
   */
  @Prop() readonly progress: number = 0

  /**
   * Specifies the direction of the progress bar, if horizonatl or vertical
   */
  @Prop({ reflect: true }) readonly direction?: DirectionType = 'horizontal'

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant: ThemeVariantType = 'primary'

  /**
   * Sets the steps that can be pronounced by accessibility technologies
   */
  @Prop() readonly steps: string = 'Inizio,Un quarto,Metà,Tre quarti,Fine'

  componentWillLoad (): void {
    this.stepsList = this.steps.split(',')
    this.setProgress(this.progress)
  }

  componentDidLoad (): void {
    removeAttributesIf(this.element, 'aria-hidden', 'true', ['aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext', 'role'])
  }

  private setProgress (progress: number): void {
    if (this.steps) {
      this.currentStep = this.stepsList[Math.round(progress * (this.stepsList.length - 1))]
      if (!ifAttribute(this.element, 'aria-hidden')) {
        this.element.setAttribute('aria-valuetext', this.currentStep)
      }
    }
  }

  @Watch('progress')
  progressChanged (progress: number): void {
    this.setProgress(progress)
  }

  @Watch('steps')
  stepsChanged (steps: string): void {
    this.stepsList = steps.split(',')
  }

  render () {
    return (
      <Host aria-valuemax="100" aria-valuemin="0" aria-valuenow={ !ifAttribute(this.element, 'aria-hidden') && Math.round(this.progress * 100) } role="progressbar">
        <div class="contrast-area"></div>
        <div class="progress" style={
          this.direction === 'horizontal'
            ? { flexGrow: `${this.progress}` }
            : { flexGrow: `${this.progress}`, width: '100%' }
        }></div>
      </Host>
    )
  }
}
