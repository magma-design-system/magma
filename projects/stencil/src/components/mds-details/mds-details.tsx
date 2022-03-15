import { Component, Host, h, Prop, State, Event, Watch, EventEmitter } from '@stencil/core'
import clsx from 'clsx'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'

@Component({
  tag: 'mds-details',
  styleUrl: 'mds-details.css',
  shadow: true,
})
export class MdsDetails {

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
          <header class="header">
            <div class="title" onClick={ this.toggle }>
              <slot name="title"/>
            </div>
            <i onClick={ this.toggle } class={clsx('svg helper-icon', this.isOpened && 'opened')} innerHTML={miBaselineKeyboardArrowDown}/>
          </header>
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
