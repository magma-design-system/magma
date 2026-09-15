import { h } from '@stencil/core';

import { languageDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Preferences / Language',
  argTypes: {
    set: {
      type: { name: 'string' },
      options: languageDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
};
const Template = (args) => (
  <mds-pref-language {...args}>
    <mds-pref-language-item code="it"></mds-pref-language-item>
    <mds-pref-language-item code="en"></mds-pref-language-item>
    <mds-pref-language-item code="el"></mds-pref-language-item>
  </mds-pref-language>
);

export const Default = {
  // TODO a11y: the mds-dropdown wires aria-controls on the mds-tab-item host it targets, which
  // axe then rejects as a child of the tablist (the tab is the inner button)
  parameters: { a11y: { test: 'todo' } },
  render: Template,

  args: {},
};
