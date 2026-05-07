import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core'
import clsx from 'clsx'
import miBaselineKeyboardArrowRight from '@icon/mi/baseline/keyboard-arrow-right.svg'
import { KeyboardManager } from '@common/keyboard-manager'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot icon - Insert an icon image, it can be `HTML elements` or `components`, it is **recommended** to add `mds-icon` element.
 * @slot title - Add a `text string`, `HTML elements` or `components`, it is **recommended** to use `mds-text` element.
 * @part header - The header of the component
 * @part title - The title of the component
 * @part content - The content wrapper of the `default` and `content` slots
 */

@Component({
  tag: 'mds-details',
  styleUrl: 'mds-details.css',
  shadow: true,
})
export class MdsDetails {

  @Element() private host: HTMLMdsDetailsElement
  @State() isOpened: boolean
  @State() hasIcon: boolean = true
  private km = new KeyboardManager()
  /**
   * Specifies if the component is opened
   */
  @Prop({ mutable: true, reflect: true }) opened = false

  /**
   * Emits when the component is opened
   */
  @Event({ eventName: 'mdsDetailsChange' }) changedEvent: EventEmitter<boolean>

  @Watch('opened')
  validateOpened (newValue: boolean): void {
    this.isOpened = newValue
  }

  componentWillLoad (): void {
    this.isOpened = this.opened
    this.checkIcon()
  }

  componentDidLoad (): void {
    const header = this.host.shadowRoot?.querySelector('.header') as HTMLElement
    this.km.addElement(header)
    this.km.attachClickBehavior()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  private toggle = () => {
    this.isOpened = !this.isOpened
    this.changedEvent.emit(this.isOpened)
  }

  private checkIcon = (): void => {
    this.hasIcon = this.host.querySelector(':scope > [slot="icon"]') !== null
  }

  private onSlotChangeHandler = (): void => {
    this.checkIcon()
  }

  render () {
    return (
      <Host>
        <div class={clsx('icon', this.hasIcon ? '' : 'icon--hidden')} onClick={ this.toggle }>
          <slot name="icon" onSlotchange={ this.onSlotChangeHandler }/>
        </div>
        <div class="content">
          <header class="header" part="header" tabindex="0" onClick={ this.toggle }>
            <div class="title" part="title">
              <slot name="title"/>
            </div>
            <i class={clsx('helper-icon', this.isOpened && 'opened')} innerHTML={miBaselineKeyboardArrowRight}/>
          </header>
          <div class={clsx('details', this.isOpened && 'opened')}>
            <div class="content-expander" part="content">
              <slot/>
              <div class="actions">
                <slot name="action"/>
              </div>
            </div>
          </div>
        </div>
      </Host>
    )
  }
}
