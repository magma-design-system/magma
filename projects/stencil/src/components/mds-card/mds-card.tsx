import { Component, Element, Host, h, State, Prop } from '@stencil/core';
import { preferenceStore } from '@common/preference';
import clsx from 'clsx';

// the regions of the card, in the alphabetical order their initials name a layout with
const REGIONS = ['content', 'footer', 'header', 'media'];

/**
 * @part layout - The layout element that wraps the slotted content
 * @slot media - Add `HTML elements` or `components`Add `HTML elements` or `components`, it is **recommended** to use `mds-img` element or other component to represent media contents, used for images or videos, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
 * @slot header - Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
 * @slot content - Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
 * @slot footer - Add `HTML elements` or `components`, it's responsive behaviour based on container queries is handled with `auto-grid` enabled
 * @category structure
 */

@Component({
  tag: 'mds-card',
  styleUrl: 'mds-card.css',
  shadow: true,
})
export class MdsCard {
  @Element() private host: HTMLMdsCardElement;
  @State() layout: string;

  /**
   * Disables the automatic responsive behavior based on container queries
   */
  @Prop({ reflect: true }) readonly disableAutoGrid: boolean = false;

  /**
   * Names the layout after the regions that have content, by their initials (`cfhm` with all
   * four). A child goes in the region of its `slot`, an `mds-card-*` without one in the region of
   * its name, since the card reads it before it has written its own slot. The layout used to be
   * read once, on load, and to name a slotted element after its tag (`d` for a
   * `<div slot="header">`), a layout no rule draws.
   */
  private updateLayout = (): void => {
    const regions = new Set(
      Array.from(this.host.children).map(
        (child) =>
          child.getAttribute('slot') ??
          (child.tagName.startsWith('MDS-CARD-')
            ? child.tagName.toLowerCase().replace('mds-card-', '')
            : ''),
      ),
    );
    this.layout = REGIONS.filter((region) => regions.has(region))
      .map((region) => region.charAt(0))
      .join('');
  };

  componentWillLoad(): void {
    this.updateLayout();
  }

  render() {
    return (
      <Host
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div
          class={clsx(
            'layout',
            this.layout && `layout--${this.layout}`,
            this.disableAutoGrid ? 'layout--disabled' : '',
          )}
          part="layout"
        >
          <slot name="media" onSlotchange={this.updateLayout} />
          <slot name="header" onSlotchange={this.updateLayout} />
          <slot name="content" onSlotchange={this.updateLayout} />
          <slot name="footer" onSlotchange={this.updateLayout} />
        </div>
      </Host>
    );
  }
}
