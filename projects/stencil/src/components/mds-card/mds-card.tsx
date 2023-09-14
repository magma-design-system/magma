import { Component, Element, Host, h, State, Prop } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-card',
  styleUrl: 'mds-card.css',
  shadow: true,
})
export class MdsCard {

  @Element() private host: HTMLMdsCardElement
  @State() layout: string

  /**
   * Enables automatic responsive behavior based on container queries
   */
  @Prop({ reflect: true }) readonly autoGrid = true

  componentDidLoad (): void {
    this.layout = ''
    if (this.host.querySelector('[slot="media"]') !== null) {
      this.layout += 'm'
    }
    if (this.host.querySelector('[slot="header"]') !== null) {
      this.layout += 'h'
    }
    if (this.host.querySelector('[slot="content"]') !== null) {
      this.layout += 'c'
    }
    if (this.host.querySelector('[slot="footer"]') !== null) {
      this.layout += 'f'
    }
  }

  /**
  * @slot media - Add a media element, used for images or videos, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
  * @slot header - slot for header, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
  * @slot content - slot for content, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
  * @slot footer - slot for footer, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
  */

  render () {
    return (
      <Host>
        <div class={clsx('layout', this.layout && `layout--${this.layout}`, !this.autoGrid ? 'layout--disabled' : '')} part="container">
          <slot name="media"/>
          <slot name="header"/>
          <slot name="content"/>
          <slot name="footer"/>
        </div>
      </Host>
    )
  }

}
