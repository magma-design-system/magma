import clsx from 'clsx'
import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { MdsBadge } from '../mds-badge/mds-badge'
import { TypographyType } from '@type/typography'

@Component({
  tag: 'mds-stepper-bar-item',
  styleUrl: 'mds-stepper-bar-item.css',
  shadow: true,
})
export class MdsStepperBarItem {

  @Element() private host: HTMLMdsStepperBarItemElement
  private km = new KeyboardManager()


  @State() isChecked: boolean
  @State() isCurrent: boolean
  @State() index: number

  /**
   * Specifies a short description of the component
   */
  @Prop() readonly text!: string

  /**
   * Specifies if the step is displayed
   */
  @Prop() readonly step: boolean

  /**
   * Specifies if the badge status is displayed
   */
  @Prop({ mutable: true, reflect: true }) badge: boolean

  /**
   * Specifies the icon displayed of the component when is not checked or the current item
   */
  @Prop() readonly icon!: string

  /**
   * Specifies the icon displayed of the component when is checked
   */
  @Prop() iconChecked? = this.icon

  /**
   * Specifies if the component is checked or not
   */
  @Prop({ reflect: true }) readonly checked?: boolean

  /**
   * Specifies if the component is the current or not
   */
  @Prop({ mutable: true, reflect: true }) current?: boolean

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyType = 'h6'

  componentWillLoad (): void {
    this.isCurrent = this.current
    this.isChecked = this.checked
    this.index = [...Array.from(this.host.parentElement.childNodes)].indexOf(this.host)
  }

  componentDidLoad = (): void => {
    const header = this.host.shadowRoot.querySelector('header')
    this.km.addElement(header)
    this.km.attachClickBehavior()
  }

  disconnectedCallback = (): void => {
    this.km.detachClickBehavior()
  }

  @Watch('checked')
  checkChecked (newValue: boolean): void {
    this.isChecked = newValue
  }

  @Watch('current')
  checkCurrent (newValue: boolean): void {
    this.isCurrent = newValue
  }

  private toggle = () => {
    this.isCurrent = true
    if (this.isCurrent) {
      this.currentEvent.emit(this.host.id)
    }
  }

  private showBadge = (): MdsBadge => {
    if (this.isChecked) {
      return <mds-badge class="badge" variant="success" tone="weak" typography="option">Completato</mds-badge>
    }
    if (this.isCurrent) {
      return <mds-badge class="badge" variant="info" tone="weak" typography="option">In corso</mds-badge>
    }
    return <mds-badge class="badge" variant="dark" tone="weak" typography="option">In coda</mds-badge>
  }

  /**
   * Emits when the accordion is current
   */
  @Event() currentEvent: EventEmitter<string>

  render () {
    return (
      <Host>
        <header class="header focusable" onClick={ this.toggle } tabindex="0">
          <mds-icon class="icon" name={ clsx(this.isChecked && !this.isCurrent ? this.iconChecked : this.icon) }/>
          <mds-progress class="progress" progress={ this.isChecked ? 1 : 0 }/>
        </header>
        <div class="infos" onClick={ this.toggle }>
          { this.step && <mds-text class="step" typography="option">step { this.index + 1 }</mds-text> }
          { this.text && <mds-text class="text" typography={ this.typography }>{ this.text }</mds-text> }
          { this.badge && <div>{ this.showBadge() }</div> }
        </div>
      </Host>
    )
  }
}
