import { Component, Host, h } from '@stencil/core';
import { preferenceStore } from '@common/preference';

@Component({
  tag: 'mds-hr',
  styleUrl: 'mds-hr.css',
  shadow: true,
})
export class MdsHr {
  render() {
    return (
      <Host
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      />
    );
  }
}
