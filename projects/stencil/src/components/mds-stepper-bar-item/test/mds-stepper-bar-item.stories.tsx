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
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mi/baseline/agriculture" label="First"/>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mi/baseline/adobe" label="Second"/>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" {...args}/>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mi/baseline/css" label="Forth"/>
    <mds-stepper-bar-item icon-checked="mi/baseline/done" icon="mdi/baseball" label="Fifth"/>
  </mds-stepper-bar>

const TemplateDone = args =>
  <mds-stepper-bar items-done={3}>
    <mds-stepper-bar-item done icon="mi/baseline/agriculture" icon-checked={args['icon-checked']} label="First"/>
    <mds-stepper-bar-item done icon="mi/baseline/adobe" icon-checked={args['icon-checked']} label="Second"/>
    <mds-stepper-bar-item {...args}/>
    <mds-stepper-bar-item icon="mi/baseline/css" label="Forth"/>
    <mds-stepper-bar-item icon="mi/baseline/local-activity" label="Fifth"/>
  </mds-stepper-bar>

// mi_baseline_local-activity
// mi_baseline_bluetooth

const defaultArgs = {
  icon: 'mi/baseline/book',
  label: 'Third',
}

export const Default = Template.bind({})
Default.args = {
  ...defaultArgs,
}

export const Done = TemplateDone.bind({})
Done.args = {
  ...defaultArgs,
  done: true,
}

export const Current = TemplateDone.bind({})
Current.args = {
  ...defaultArgs,
  current: true,
}

export const IconChecked = TemplateDone.bind({})
IconChecked.args = {
  ...defaultArgs,
  done: true,
  'icon-checked': 'mi/baseline/done',
}

export const Text = Template.bind({})
Text.args = {
  ...defaultArgs,
  text: 'Item text',
}

export const Typography = Template.bind({})
Typography.args = {
  ...defaultArgs,
  typography: 'paragraph',
}
