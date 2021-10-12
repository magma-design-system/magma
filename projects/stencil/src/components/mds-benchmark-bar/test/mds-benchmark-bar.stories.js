import React from 'react'
import faker from 'faker'
import MdsBenchmarkBar from '@component/mds-benchmark-bar/mds-benchmark-bar'
import { themeVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Benchmark Bar',
  component: MdsBenchmarkBar,
  argTypes: {
    variant: {
      type: { name: 'string', required: false },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
    value: {
      control: { type: 'range', step: 1, min: 0, max: 100 },
      type: { name: 'number', required: false },
      description: 'A value between 0 and 100 that rapresents the benchmark',
    },
  },
}

const Template = args =>
  <mds-benchmark-bar {...args}>
    This is a benchmark bar that will be cropped if the text is too long
  </mds-benchmark-bar>

export const Default = Template.bind({})
Default.args = {
  value: 30,
}
