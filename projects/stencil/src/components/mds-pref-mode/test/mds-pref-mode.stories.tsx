import { h } from '@stencil/core';
import { modeDictionary, transitionDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Preferences / Mode',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: modeDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
    transition: {
      type: { name: 'string' },
      options: transitionDictionary,
      control: { type: 'select' },
      description: 'Specifies the transition of switching from a theme to another one',
    },
  },
};
const Template = (args) => <mds-pref-mode {...args} />;

export const Default = {
  render: Template,

  args: {},
};
