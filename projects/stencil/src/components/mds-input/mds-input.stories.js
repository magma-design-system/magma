import React from 'react'
import faker from 'faker'
import MdsInput from '../../../dist/collection/components/mds-input/mds-input'

export default {
  title: 'Form / Input',
  component: MdsInput,
  argTypes: {
    name: {
      type: 'text',
      description:
        'Is needed to reference the form data after the form is submitted',
      defaultValue: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'If true, the button is displayed as disabled',
      defaultValue: false,
    },
  },
}

export const Default = args =>
  <mds-input {...args} value={faker.lorem.paragraph()}></mds-input>
