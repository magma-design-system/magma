import React from 'react'
import MdsInputField from '@component/mds-input-field/mds-input-field'
import { autoCompleteDictionary } from '@dictionary/autocomplete'
import { statusDictionary } from '@dictionary/status'
import { inputTextTypeDictionary } from '@dictionary/input-text-type'
import faker from 'faker'

export default {
  title: 'Form / Input / Input Field',
  component: MdsInputField,
  argTypes: {
    autocomplete: {
      description: 'Specifies whether the element should have autocomplete enabled',
      options: autoCompleteDictionary,
      control: { type: 'select' },
    },
    autofocus: {
      type: { name: 'boolean', required: false },
      description: 'Specifies that the element should automatically get focus when the page loads',
    },
    disabled: {
      type: { name: 'boolean', required: false },
      description: 'If true, the element is displayed as disabled',
    },
    label: {
      type: { name: 'string', required: false },
      description: 'Display a text on the top of the input text field',
    },
    max: {
      type: { name: 'number', required: false },
      description: 'Specifies the maximum value',
    },
    maxLength: {
      type: { name: 'number', required: false },
      description: 'Specifies the maximum number of characters allowed in an element',
    },
    message: {
      type: { name: 'string', required: false },
      description: 'Display a message at the bottom of the input text field',
    },
    min: {
      type: { name: 'number', required: false },
      description: 'Specifies the minimum value',
    },
    minLength: {
      type: { name: 'number', required: false },
      description: 'Specifies the minimum number of characters allowed in an element',
    },
    name: {
      type: { name: 'string', required: false },
      description: 'Is needed to reference the form data after the form is submitted',
    },
    pattern: {
      type: { name: 'string', required: false },
      description: 'Specifies a regular expression that element\'s value is checked against',
    },
    placeholder: {
      type: { name: 'string', required: false },
      description: 'Specifies a short hint that describes the expected value of the element',
    },
    readOnly: {
      type: { name: 'boolean', required: false },
      description: 'Specifies that the element is read-only',
    },
    required: {
      type: { name: 'boolean', required: false },
      description: 'Specifies that the element must be filled out before submitting the form',
    },
    step: {
      type: { name: 'string', required: false },
      description: 'Specifies the interval between legal numbers in an input field',
    },
    status: {
      type: { name: 'string', required: false },
      description: 'Display the status of a message at the bottom of the input text field',
      options: statusDictionary,
      control: { type: 'select' },
    },
    'status-tip': {
      type: { name: 'string', required: false },
      description: 'Sets the message of the status of the input field',
    },
    type: {
      type: { name: 'string', required: true },
      description: 'Specifies the type of element',
      options: inputTextTypeDictionary,
      control: { type: 'select' },
    },
    value: {
      type: { name: 'string', required: false },
      description: 'Specifies the value of the element',
    },
  },
}

const Template = args =>
  <mds-input-field {...args}></mds-input-field>

export const Default = Template.bind({})
Default.args = {
  label: 'Questo è un label',
  placeholder: 'Scrivi qualcosa',
}

export const autoComplete = Template.bind({})
autoComplete.args = {
  label: 'Questo è un label',
  autocomplete: 'address',
  type: 'text',
  placeholder: 'Intestatario carta di credito',
}

export const autoFocus = Template.bind({})
autoFocus.args = {
  label: 'Questo è un label',
  autofocus: true,
  placeholder: 'Auto focus input text',
}

export const Disabled = Template.bind({})
Disabled.args = {
  label: 'Questo è un label',
  disabled: true,
  placeholder: 'Input field with disabled attribute',
}

export const max = Template.bind({})
max.args = {
  label: 'Questo è un label',
  max: '3',
  type: 'number',
  value: '2',
}

export const Required = Template.bind({})
Required.args = {
  label: 'Questo è un label',
  required: true,
  placeholder: 'This is a required field',
}

export const readOnly = Template.bind({})
readOnly.args = {
  label: 'Questo è un label',
  readOnly: true,
  value: 'This is a read only field',
}

export const message = Template.bind({})
message.args = {
  label: 'Questo è un label',
  placeholder: 'This is a field with a message',
  message: faker.lorem.paragraph(1),
}

export const status = Template.bind({})
status.args = {
  label: 'Questo è un label',
  placeholder: 'This is a field with a message',
  status: 'error',
  value: 'Input field text',
  'status-tip': 'errore',
  message: faker.lorem.paragraph(1),
}
