import { directionDictionary } from '../meta/dictionary'
import { themeVariantDictionary } from '@dictionary/variant'
import { h } from '@stencil/core'
import { typographyTechnicalDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Progress',
  argTypes: {
    direction: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description:
        'Specifies the direction of the progress bar, if horizonatl or vertical',
      options: directionDictionary,
    },
    progress: {
      control: { type: 'range', step: 0.01, min: 0, max: 1 },
      type: { name: 'number', required: false },
      description:
        'A value between 0 and 1 that rapresents the status progress',
    },
    typography: {
      type: { name: 'string', required: false },
      description: 'Specifies the typography of the progress bar',
      options: typographyTechnicalDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string', required: false },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args => (
  <mds-progress aria-label="Progress bar title" {...args} />
)

export const Default = {
  render: Template,

  args: {
    progress: 0.35,
  },
}

export const Vertical = {
  render: Template,

  args: {
    progress: 0.35,
    direction: 'vertical',
    style: {
      height: '200px',
    },
  },
}

export const Radial = {
  render: Template,

  args: {
    progress: 0.35,
    direction: 'radial',
    style: {
      width: '64px',
    },
  },
}
