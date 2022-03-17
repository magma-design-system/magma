import React from 'react'
import MdsSwitch from '@component/mds-input-switch/mds-input-switch'
import { typographySecondaryDictionary } from '@dictionary/typography'
import { inputSwitchSizeDictionary } from '../meta/dictionary'
import { iconsDictionary } from '@dictionary/icon'

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
      options: iconsDictionary,
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
    size: {
      control: { type: 'select' },
      description: 'Specifies the size for the switch toggle, it works only if attribute "type" is set to "switch"',
      options: inputSwitchSizeDictionary,
      type: { name: 'string' },
    },
    typography: {
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographySecondaryDictionary,
      type: { name: 'string' },
    },
    type: {
      control: { type: 'select' },
      description: 'Specifies the type of element',
      options: ['switch', 'checkbox', 'radio'],
      type: { name: 'string' },
    },
    value: {
      type: { name: 'string' },
      description: 'Specifies the value of the input element',
    },
  },
}

const Template = args =>
  <mds-input-switch {...args}>Notifiche via e-mail</mds-input-switch>

const TemplateMultiple = args =>
  <form name="form-name" className="grid grid-cols-1 gap-4">
    <mds-input-switch {...args} value="1">Accetto</mds-input-switch>
    <mds-input-switch {...args} value="2">Non accetto</mds-input-switch>
  </form>

export const Default = Template.bind({})
Default.args = {
  name: 'input-name',
  type: 'switch',
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
