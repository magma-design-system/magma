import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import { mentionSizeDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Mention',
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description:
        'Shows the remove button; its click emits `mdsMentionDelete` with the mention element',
      control: { type: 'boolean' },
    },
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: 'The label of the component',
    },
    size: {
      type: { name: 'string' },
      description: 'The size of the component',
      options: mentionSizeDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-text>
    Ciao <mds-mention {...args}></mds-mention>, sei riuscito poi a inviare il messaggio?
  </mds-text>
);

export const Default = {
  render: Template,

  args: {
    label: 'mario.rossi',
  },
};

export const Deletable = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <mds-mention {...args} size="sm"></mds-mention>
      <mds-mention {...args} size="md"></mds-mention>
      <mds-mention {...args} size="lg"></mds-mention>
    </div>
  ),

  args: {
    deletable: true,
    label: 'mario.rossi',
  },
};
