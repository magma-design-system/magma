import React from 'react'
import MdsInputRange from '@component/mds-input-range/mds-input-range'

export default {
  title: 'Form / Range',
  component: MdsInputRange,
  argTypes: {
    min: {
      type: { name: 'number', required: true },
      description: 'The lowest value in the range of permitted values',
    },
    max: {
      type: { name: 'number', required: true },
      description: 'The greatest value in the range of permitted values',
    },
    step: {
      type: { name: 'number', required: true },
      description: 'The step attribute is a number that specifies the granularity that the value must adhere to, or the special value any, which is described below',
    },
    value: {
      type: { name: 'number', required: true },
      description: 'The value attribute contains a number which contains a representation of the selected number',
    },
  },
}

const Template = args =>
  <mds-input-range {...args}>
    Range label
  </mds-input-range>

export const Default = Template.bind({})

export const Min = Template.bind({})
Min.args = {
  min: 0,
  max: 100,
  step: 1,
  value: 10,
}
