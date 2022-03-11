import React from 'react'
import MdsStepper from '@component/mds-stepper/mds-stepper'

export default {
  title: 'UI / Stepper',
  component: MdsStepper,
  argTypes: {
    linear: {
      type: { name: 'boolean' },
      description: 'Sets if the component should handle checked elements from the first to the last child or not',
    },
    select: {
      type: { name: 'number' },
      description: 'Sets the current item to the given index: 0 is none selected, 1 is the first item selected, last number + 1 is all items checked',
    },
  },
}

const Template = args =>
  <mds-stepper {...args}>
    <mds-stepper-item checked icon="mi/baseline/agriculture" text="Scavatore"/>
    <mds-stepper-item checked icon="mi/baseline/adobe" text="Calendario"/>
    <mds-stepper-item checked icon="mi/baseline/book" text="Activate"/>
    <mds-stepper-item icon="mi/baseline/css" text="Puppo"/>
    <mds-stepper-item icon="mi/baseline/done" text="Login"/>
  </mds-stepper>

export const Default = Template.bind({})
export const Select = Template.bind({})
Select.args = {
  select: 2
}

export const Linear = Template.bind({})
Linear.args = {
  linear: false
}
