import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core'
import clsx from 'clsx'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import { addKeyboardListener, removeKeyboardListener } from '@common/keyboard'

@Component({
  tag: 'mds-details',
  styleUrl: 'mds-details.css',
  shadow: true,
})
export class MdsDetails {

  @Element() private host: HTMLMdsDetailsElement
  @State() isOpened: boolean

  /**
   * Specifies if the component is opened
   */
  @Prop({ mutable: true, reflect: true }) opened?: boolean

  /**
   * Emits when the component is opened
   */
  @Event() openedEvent: EventEmitter<void>

  @Watch('opened')
  validateOpened (newValue: boolean): void {
    this.isOpened = newValue
  }

  componentWillLoad (): void {
    this.isOpened = this.opened
  }

  componentDidLoad (): void {
    const header = this.host.shadowRoot.querySelector('.header') as HTMLElement
    addKeyboardListener(header)
  }

  disconnectedCallback (): void {
    const header = this.host.shadowRoot.querySelector('.header') as HTMLElement
    removeKeyboardListener(header)
  }

  private toggle = () => {
    this.isOpened = !this.isOpened
    if (this.isOpened) {
      this.openedEvent.emit()
    }
  }

  render () {
    return (
      <Host>
        <div class="icon" onClick={ this.toggle }>
          <slot name="icon"/>
        </div>
        <div class="contents">
          <div>
            <header class="header focusable" tabindex="0" onClick={ this.toggle }>
              <div class="title">
                <slot name="title"/>
              </div>
              <i class={clsx('svg helper-icon', this.isOpened && 'opened')} innerHTML={miBaselineKeyboardArrowDown}/>
            </header>
          </div>
          <div class={clsx('details', this.isOpened && 'opened')}>
            <slot/>
            <div class="actions">
              <slot name="action"/>
            </div>
          </div>
        </div>
      </Host>
    )
  }
}
