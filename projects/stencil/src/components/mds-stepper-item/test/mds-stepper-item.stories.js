import React from 'react'
import MdsStepper from '@component/mds-stepper/mds-stepper'
import { typographySecondaryDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Stepper / Stepper item',
  component: MdsStepper,
  argTypes: {
    checked: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is checked or not',
    },
    current: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is the current or not',
    },
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon displayed of the component when is not checked or the current item',
    },
    'icon-checked': {
      type: { name: 'string' },
      description: 'Specifies the icon displayed of the component when is checked',
    },
    text: {
      type: { name: 'string' },
      description: 'Specifies a short description of the component',
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographySecondaryDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-stepper select="0">
    <mds-stepper-item icon="mi/baseline/agriculture" text="First"/>
    <mds-stepper-item icon="mi/baseline/adobe" text="Second"/>
    <mds-stepper-item {...args}/>
    <mds-stepper-item icon="mi/baseline/css" text="Forth"/>
    <mds-stepper-item icon="mi/baseline/done" text="Fifth"/>
  </mds-stepper>

const defaultArgs = {
  icon: 'mi/baseline/book',
  text: 'Third',
}

export const Default = Template.bind({})
Default.args = {
  ...defaultArgs,
}

export const checked = Template.bind({})
checked.args = {
  ...defaultArgs,
  checked: true,
}

export const current = Template.bind({})
current.args = {
  ...defaultArgs,
  current: true,
}

export const iconChecked = Template.bind({})
iconChecked.args = {
  ...defaultArgs,
  checked: true,
  'icon-checked': 'mi/baseline/done',
}

export const text = Template.bind({})
text.args = {
  ...defaultArgs,
  text: 'Item text',
}

export const typography = Template.bind({})
typography.args = {
  ...defaultArgs,
  typography: 'paragraph',
}
