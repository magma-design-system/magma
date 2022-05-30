import { h } from '@stencil/core'
import { themeVariantDictionary } from '@dictionary/variant'
import { benchmarkBarTypographyDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Benchmark Bar',
  argTypes: {
    typography: {
      type: { name: 'string' },
      description: 'Sets the theme variant colors',
      options: benchmarkBarTypographyDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
    value: {
      control: { type: 'range', step: 1, min: 0, max: 100 },
      type: { name: 'number' },
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

export const Typography = Template.bind({})
Typography.args = {
  typography: 'option',
}
