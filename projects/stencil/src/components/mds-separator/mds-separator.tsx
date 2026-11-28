import { Component, Host, Prop, h } from '@stencil/core';
import { preferenceStore } from '@common/preference';
import { ToneMinimalVariantType } from '@type/tone';

/**
 * @category structure
 */
@Component({
  tag: 'mds-separator',
  styleUrl: 'mds-separator.css',
  shadow: true,
})
export class MdsSeparator {
  /**
   * Sets the intensity of the rule: `strong` draws the role of functional outlines
   * (`--magma-border-default`), `weak` the role of decorative dividers (`--magma-border-muted`),
   * for the rows of a list inside a card or a panel that already has an outline of its own
   */
  @Prop({ reflect: true }) readonly tone?: ToneMinimalVariantType = 'strong';

  render() {
    return (
      <Host
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      />
    );
  }
}
