import { iconsDictionary, mggIconsDictionary } from '@dictionary/icon'
import { typographyInfoDictionary } from '@dictionary/typography'
import { h } from '@stencil/core'

export default {
  title: 'UI / Stepper Bar / Stepper Bar Item',
  argTypes: {
    done: {
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
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
    'icon-checked': {
      type: { name: 'string' },
      description: 'Specifies the icon displayed of the component when is checked',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
    text: {
      type: { name: 'string' },
      description: 'Specifies a short description of the component',
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographyInfoDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-stepper-bar items-done={0}>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mi/baseline/agriculture" text="First"/>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mi/baseline/adobe" text="Second"/>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" {...args}/>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mi/baseline/css" text="Forth"/>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mdi/baseball" text="Fifth"/>
  </mds-stepper-bar>

const TemplateDone = args =>
  <mds-stepper-bar items-done={3}>
    <mds-stepper-bar-item done icon="mi/baseline/agriculture" icon-checked={args['icon-checked']} text="First"/>
    <mds-stepper-bar-item done icon="mi/baseline/adobe" icon-checked={args['icon-checked']} text="Second"/>
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

export const done = TemplateDone.bind({})
done.args = {
  ...defaultArgs,
  done: true,
}

export const current = TemplateDone.bind({})
current.args = {
  ...defaultArgs,
  current: true,
}

export const iconChecked = TemplateDone.bind({})
iconChecked.args = {
  ...defaultArgs,
  done: true,
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
