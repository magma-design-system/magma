import { Component, Element, Host, Prop, Watch, forceUpdate, h } from '@stencil/core';
import { ListMarkerType } from './meta/types';

/**
 * @slot - Add `mds-list-item` element/s.
 * @category data
 */

@Component({
  tag: 'mds-list',
  styleUrl: 'mds-list.css',
  shadow: true,
})
export class MdsList {
  @Element() host: HTMLMdsListElement;

  /**
   * The marker of the items: `dot` draws a glyph before the text of each item (the `icon` of the
   * item, a dot without it); `none` draws nothing and indents nothing, for a list whose items are
   * links, cards or chips: each item then takes any content, and the page lays the items out (a
   * column, a row that wraps, a grid) with classes on the list
   */
  @Prop({ reflect: true }) readonly marker: ListMarkerType = 'dot';

  // an item reads the marker of its list when it renders: a change renders the items again
  @Watch('marker')
  markerHandler(): void {
    this.host.querySelectorAll(':scope > mds-list-item').forEach((item) => forceUpdate(item));
  }

  render() {
    return (
      <Host role="list">
        <slot></slot>
      </Host>
    );
  }
}
