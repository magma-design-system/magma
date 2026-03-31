import { h } from '@stencil/core'
import { themeVariantDictionary } from '@type/variant'
import { benchmarkBarTypographyDictionary } from '../meta/dictionary'
import { progressBarSizeDictionary } from '@type/progress'

export default {
  title: 'UI / Benchmark Bar',
  argTypes: {
    alias: {
      type: { name: 'string' },
      description: 'An alias to custom how value is represented',
    },
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
    size: {
      type: { name: 'string' },
      description: 'Sets the size of the component',
      options: progressBarSizeDictionary,
      control: { type: 'select' },
    },
    value: {
      control: { type: 'range', step: 1, min: 0, max: 100 },
      type: { name: 'number' },
      description: 'A value between 0 and 100 that rapresents the benchmark',
    },
  },
}

const Template = args => (
  <mds-benchmark-bar {...args}>
    This is a benchmark bar that will be cropped if the text is too long
  </mds-benchmark-bar>
)

export const Default = {
  render: Template,

  args: {
    value: 30,
  },
}

export const Alias = {
  render: Template,

  args: {
    value: 33,
    alias: '1 of 3 tasks',
  },
}

export const Typography = {
  render: Template,

  args: {
    typography: 'option',
  },
}
