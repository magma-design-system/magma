import { Component, Host, h } from '@stencil/core';
import { preferenceStore } from '@common/preference';

@Component({
  tag: 'mds-separator',
  styleUrl: 'mds-separator.css',
  shadow: true,
})
export class MdsSeparator {
  render() {
    return (
      <Host
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      />
    );
  }
}
