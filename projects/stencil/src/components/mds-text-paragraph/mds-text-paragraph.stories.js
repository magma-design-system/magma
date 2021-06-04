import React from 'react'
import faker from 'faker'
import MdsTextParagraph from '../../../dist/collection/components/mds-text-paragraph/mds-text-paragraph';

export default {
  title: 'MdsTextParagraph',
  component: MdsTextParagraph,
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
  return <mds-text-paragraph class="p-2 bg-status-warning-18" {...args}>
    {faker.lorem.paragraph()}
  </mds-text-paragraph>
}

export const Default = Template.bind({});
Default.args = { ...defaultArgs };
