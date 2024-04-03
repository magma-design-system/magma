import { Component, Element, Host, h, State, Prop } from '@stencil/core'
import clsx from 'clsx'

/**
  * @slot media - Add `HTML elements` or `components`Add `HTML elements` or `components`, it is **recommended** to use `mds-img` element or other component to represent media contents, used for images or videos, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
  * @slot header - Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
  * @slot content - Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
  * @slot footer - Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
  */

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
  @Prop({ reflect: true }) readonly autoGrid: boolean = true

  componentWillLoad (): void {
    this.layout = Array.from(this.host.children)
      // check custom slot
      .map(c => (c.getAttribute('slot')
        // if no custom slot find mds-card-{component}
        ?? c.tagName.startsWith('MDS-CARD-')
        // replace mds-card-header with header (for all mds-card-{component})
        ? c.tagName.toLocaleLowerCase().replace('mds-card-', '')
        // if find other tag do nothing
        : ''))
      .sort()
      .reduce((prev, curr) => prev + curr.charAt(0), '')
  }

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
