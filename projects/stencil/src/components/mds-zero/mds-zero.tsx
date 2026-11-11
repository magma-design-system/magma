import { Component, Element, Host, State, h } from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import { preferenceStore } from '@common/preference';
import clsx from 'clsx';

/**
 * @slot - Add `HTML elements` or `components` to this slot, it is **recommended** to use `mds-img` or `img` element.
 * @slot content - Put text elements here,
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @part contents - Selects the wrapper of the elements with attribute `slot="content"`.
 * @part actions - Selects the wrapper of the elements with attribute `slot="action"`.
 * @category feedback
 */

@Component({
  tag: 'mds-zero',
  styleUrl: 'mds-zero.css',
  shadow: true,
})
export class MdsZero {
  @Element() private host: HTMLMdsZeroElement;
  @State() hasActions: boolean;

  private onActionSlotChange = (): void => {
    this.hasActions = hasChildWithSlot(this.host, 'action');
  };

  componentWillLoad(): void {
    this.hasActions = hasChildWithSlot(this.host, 'action');
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <slot />
        <div class="contents" part="contents">
          <slot name="content" />
        </div>
        {/* with no action the footer takes no room: the gap before it would add to the inset */}
        <footer class={clsx('actions', !this.hasActions && 'actions--hidden')} part="actions">
          <slot name="action" onSlotchange={this.onActionSlotChange} />
        </footer>
      </Host>
    );
  }
}
