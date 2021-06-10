import React from 'react'
import faker from 'faker'
import MdsTypoH1 from '../../../dist/collection/components/mds-typo-h1/mds-typo-h1';

export default {
  title: 'MdsTypoH1',
  component: MdsTypoH1,
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

// TODO: la build di stencil esporta anche i valori default, circa 4KB di roba, va tolta e resa solo globale?

const Template = args => {
  return <mds-typo-h1 class="bg-brand-maggioli-06 text-brand-maggioli-12 p-10" {...args}>
    {faker.lorem.paragraph()}
  </mds-typo-h1>
}

export const Default = Template.bind({});
Default.args = { ...defaultArgs };
