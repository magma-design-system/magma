import React from 'react'
import MdsSwitch from '@component/mds-input-switch/mds-input-switch'
import faker from 'faker'
import { typographySecondaryDictionary } from '@dictionary/typography'
import mggIconsDictionary from '@maggioli-design-system/icons/resources/mgg-icons.json'

export default {
  title: 'Form / Switch',
  component: MdsSwitch,
  argTypes: {
    autofocus: {
      type: { name: 'boolean', required: false },
      description: 'Sets or returns whether a checkbox should automatically get focus when the page loads',
    },
    checked: {
      type: { name: 'boolean', required: false },
      description: 'Specifies that an <input> element should be pre-selected when the page loads (for type="checkbox" or type="radio")',
    },
    disabled: {
      type: { name: 'boolean', required: false },
      description: 'Sets or returns whether a checkbox is disabled, or not',
    },
    icon: {
      type: { name: 'string', required: false },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: Object.keys(mggIconsDictionary).sort(),
      control: { type: 'select' },
    },
    indeterminate: {
      type: { name: 'boolean', required: false },
      description: 'Sets or returns the indeterminate state of the checkbox',
    },
    name: {
      type: { name: 'string', required: false },
      description: 'Specifies the name of an <input> element',
    },
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographySecondaryDictionary,
      control: { type: 'select' },
    },
    type: {
      type: { name: 'string', required: true },
      description: 'Specifies the type of element',
      options: ['switch', 'checkbox', 'radio'],
      control: { type: 'select' },
    },
    value: {
      type: { name: 'string', required: true },
      description: 'Specifies the value of the input element',
    },
  },
}

const Template = args =>
  <mds-input-switch {...args}>{faker.lorem.words(10)}</mds-input-switch>

const TemplateMultiple = args =>
  <form name="form-name">
    <mds-input-switch {...args} value="1">{faker.lorem.words(10)}</mds-input-switch>
    <mds-input-switch {...args} value="2">{faker.lorem.words(10)}</mds-input-switch>
  </form>

export const Default = Template.bind({})
Default.args = {
  name: 'input-name',
  value: '1',
}

export const checkbox = Template.bind({})
checkbox.args = {
  name: 'checkbox-name',
  type: 'checkbox',
  value: '1',
}

export const radio = TemplateMultiple.bind({})
radio.args = {
  name: 'radio-name',
  type: 'radio',
  value: '1',
}
