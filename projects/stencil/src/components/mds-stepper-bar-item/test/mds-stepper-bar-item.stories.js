import React from 'react'
import MdsStepperBar from '@component/mds-stepper-bar/mds-stepper-bar'
import { typographySecondaryDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Stepper Bar / Stepper Bar Item',
  component: MdsStepperBar,
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
  <mds-stepper-bar select="0">
    <mds-stepper-bar-item icon="mi/baseline/agriculture" text="First"/>
    <mds-stepper-bar-item icon="mi/baseline/adobe" text="Second"/>
    <mds-stepper-bar-item {...args}/>
    <mds-stepper-bar-item icon="mi/baseline/css" text="Forth"/>
    <mds-stepper-bar-item icon="mi/baseline/done" text="Fifth"/>
  </mds-stepper-bar>

const TemplateChecked = args =>
  <mds-stepper-bar select="3">
    <mds-stepper-bar-item checked icon="mi/baseline/agriculture" icon-checked={args['icon-checked']} text="First"/>
    <mds-stepper-bar-item checked icon="mi/baseline/adobe" icon-checked={args['icon-checked']} text="Second"/>
    <mds-stepper-bar-item {...args}/>
    <mds-stepper-bar-item icon="mi/baseline/css" text="Forth"/>
    <mds-stepper-bar-item icon="mi/baseline/local-activity" text="Fifth"/>
  </mds-stepper-bar>

// mi_baseline_local-activity
// mi_baseline_bluetooth

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

export const iconChecked = TemplateChecked.bind({})
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
