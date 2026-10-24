import { h } from '@stencil/core';
import { keyboardKeyNameDictionary } from '@type/keyboard';

export default {
  title: 'UI / Tags / Keyboard / Key',
  id: 'ui-keyboard-key',
  argTypes: {
    name: {
      type: { name: 'string' },
      description:
        'Sets the name of the keyboard key for combination tests if `try` attribute is set from `mds-keyboard` parent component',
      options: keyboardKeyNameDictionary,
      control: { type: 'select' },
    },
  },
};

const TemplateSingleKey = (args) => (
  <mds-keyboard>
    <mds-keyboard-key {...args}></mds-keyboard-key>
  </mds-keyboard>
);

export const Default = {
  render: TemplateSingleKey,

  args: {
    name: 'control',
  },
};
