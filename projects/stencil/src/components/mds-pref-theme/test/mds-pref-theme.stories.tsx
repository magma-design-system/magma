import { h } from '@stencil/core';
import { themeSchemeDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Preferences / Theme',
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

const TemplateController = (args) => <mds-pref-theme {...args}></mds-pref-theme>;

const Template = (args) => (
  <mds-pref-theme {...args}>
    <mds-pref-theme-item label="Default" scheme="all" name="default" />
    <mds-pref-theme-item label="Summer" name="summer" scheme="light" />
    <mds-pref-theme-item label="Twilight" name="twilight" scheme="dark" />
  </mds-pref-theme>
);

export const Default = {
  render: TemplateController,
  args: {},
};

export const ThemeList = {
  render: Template,
  args: {},
};
