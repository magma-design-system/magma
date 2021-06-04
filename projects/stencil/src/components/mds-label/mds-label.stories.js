import React from 'react';
import MdsLabel from '../../../dist/collection/components/mds-label/mds-label';

export default {
  title: 'MdsLabel',
  component: MdsLabel,
  argTypes: {
    label: { type: 'text', description: 'The text which is shown as label' },
    name: {
      type: 'text',
      description:
        'Is needed to reference the form data after the form is submitted',
    },
    disabled: {
      type: 'boolean',
      description: 'If true, the button is displayed as disabled',
      defaultValue: { summary: false },
    },
  },
};

const defaultArgs = {
  disabled: false,
};

const Template = args => {
  return <div className="bg-brand-maggioli-18 block p-2"><mds-label {...args}>Label name</mds-label></div>
}

export const Default = Template.bind({});
Default.args = { ...defaultArgs };
