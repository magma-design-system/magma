import React from 'react'
import MdsProgress from '@component/mds-progress/mds-progress'
import { directionDictionary } from '../meta/dictionary'
import { themeVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Progress',
  component: MdsProgress,
  argTypes: {
    direction: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Specifies the direction of the progress bar, if horizonatl or vertical',
      options: directionDictionary,
    },
    progress: {
      control: { type: 'range', step: 0.01, min: 0, max: 1 },
      type: { name: 'number', required: false },
      description: 'A value between 0 and 1 that rapresents the status progress',
    },
    variant: {
      type: { name: 'string', required: false },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-progress {...args}/>

export const Default = Template.bind({})
Default.args = {
  progress: 0.35,
}
