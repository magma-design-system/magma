import React from 'react'
import MdsInput from '@component/mds-input/mds-input'
import { statusDictionary } from '@dictionary/status'
import { autoCompleteDictionary } from '@dictionary/autocomplete'
import { inputTextTypeDictionary } from '@dictionary/input-text-type'

// https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill

export default {
  title: 'Form / Input',
  component: MdsInput,
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
    max: {
      type: { name: 'number', required: false },
      description: 'Specifies the maximum value',
    },
    maxLength: {
      type: { name: 'number', required: false },
      description: 'Specifies the maximum number of characters allowed in an element',
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
      options: statusDictionary,
      control: { type: 'select' },
      description: 'Sets the status of the input field',
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
  <mds-input {...args}></mds-input>

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Scrivi qualcosa',
}

export const autoComplete = Template.bind({})
autoComplete.args = {
  autocomplete: 'address',
  type: 'text',
  placeholder: 'Intestatario carta di credito',
}

export const autoFocus = Template.bind({})
autoFocus.args = {
  autofocus: true,
  placeholder: 'Auto focus input text',
}

export const Disabled = Template.bind({})
Disabled.args = {
  disabled: true,
  placeholder: 'Input field with disabled attribute',
}

export const max = Template.bind({})
max.args = {
  max: '3',
  type: 'number',
  value: '2',
}

export const Required = Template.bind({})
Required.args = {
  required: true,
  placeholder: 'This is a required field',
}

export const readOnly = Template.bind({})
readOnly.args = {
  readOnly: true,
  value: 'This is a read only field',
}

export const status = Template.bind({})
status.args = {
  status: 'error',
  placeholder: 'Status input field',
  'status-tip': 'errore',
}
