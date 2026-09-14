import { h } from '@stencil/core';
import { themeSchemeDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Preferences / Theme Variant',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'Specifies the preference mode',
    },
    scheme: {
      type: { name: 'string' },
      options: themeSchemeDictionary,
      control: { type: 'select' },
      description: 'Specifies the transition of switching from a theme to another one',
    },
  },
};

const TemplateController = (args) => <mds-pref-theme-variant {...args}></mds-pref-theme-variant>;

const Template = (args) => (
  <mds-pref-theme-variant {...args}>
    <mds-pref-theme-variant-item label="Default" scheme="all" name="default" />
    <mds-pref-theme-variant-item label="Summer" name="summer" scheme="light" />
    <mds-pref-theme-variant-item label="Twilight" name="twilight" scheme="dark" />
  </mds-pref-theme-variant>
);

export const Default = {
  // TODO a11y: the mds-dropdown wires aria-controls on the mds-tab-item host it targets, which
  // axe then rejects as a child of the tablist (the tab is the inner button)
  parameters: { a11y: { test: 'todo' } },
  render: TemplateController,
  args: {},
};

export const ThemeList = {
  // TODO a11y: same tablist issue as Default, the dropdown targets the mds-tab-item host
  parameters: { a11y: { test: 'todo' } },
  render: Template,
  args: {},
};
