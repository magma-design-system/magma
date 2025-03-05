import { Component, Element, Host, h, State, Prop } from '@stencil/core'
import clsx from 'clsx'

/**
 * @name Button
 * @description Buttons are used to initialize an action. Button labels express what action will occur when the user interacts with it.
 * @overview
 *  <p>Buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. Button labels express what action will occur when the user interacts with it.</p>
 * @category General
 * @tags controls
 * @example <mds-button>
 *   Button CTA
 *   </mds-button>
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
