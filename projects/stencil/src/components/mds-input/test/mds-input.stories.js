import React from 'react'
import MdsInput from '@component/mds-input/mds-input'
import { citiesDictionary } from '@fixture/cities'
import { themeStatusVariantDictionary } from '@dictionary/variant'
import { autoCompleteDictionary } from '@dictionary/autocomplete'
import { inputTextTypeDictionary } from '@dictionary/input-text-type'
import { iconsDictionary } from '@dictionary/icon'

// https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill

export default {
  title: 'Form / Input / Input',
  component: MdsInput,
  argTypes: {
    autocomplete: {
      description: 'Specifies whether the element should have autocomplete enabled',
      options: autoCompleteDictionary,
      control: { type: 'select' },
    },
    autofocus: {
      type: { name: 'boolean' },
      description: 'Specifies that the element should automatically get focus when the page loads',
    },
    datalist: {
      type: { name: 'array' },
      description: 'A list of search terms to be searched from the input field, it should be used with type="search" input',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'If true, the element is displayed as disabled',
    },
    icon: {
      control: { type: 'select' },
      description: 'An icon displayed at the right of the input',
      options: iconsDictionary,
      type: { name: 'string' },
    },
    max: {
      type: { name: 'number' },
      description: 'Specifies the maximum value',
    },
    maxLength: {
      type: { name: 'number' },
      description: 'Specifies the maximum number of characters allowed in an element',
    },
    min: {
      type: { name: 'number' },
      description: 'Specifies the minimum value',
    },
    minLength: {
      type: { name: 'number' },
      description: 'Specifies the minimum number of characters allowed in an element',
    },
    name: {
      type: { name: 'string' },
      description: 'Is needed to reference the form data after the form is submitted',
    },
    pattern: {
      type: { name: 'string' },
      description: 'Specifies a regular expression that element\'s value is checked against',
    },
    placeholder: {
      type: { name: 'string' },
      description: 'Specifies a short hint that describes the expected value of the element',
    },
    readOnly: {
      type: { name: 'boolean' },
      description: 'Specifies that the element is read-only',
    },
    required: {
      type: { name: 'boolean' },
      description: 'Specifies that the element must be filled out before submitting the form',
    },
    step: {
      type: { name: 'string' },
      description: 'Specifies the interval between legal numbers in an input field',
    },
    variant: {
      type: { name: 'string' },
      options: themeStatusVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the variant of the input field',
    },
    'variant-tip': {
      type: { name: 'string' },
      description: 'Sets the message of the variant of the input field',
    },
    type: {
      type: { name: 'string', required: true },
      description: 'Specifies the type of element',
      options: inputTextTypeDictionary,
      control: { type: 'select' },
    },
    value: {
      type: { name: 'string' },
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

export const search = Template.bind({})
search.args = {
  datalist: citiesDictionary,
  type: 'search',
  placeholder: 'Search a city name...',
}

export const icon = Template.bind({})
icon.args = {
  icon: 'mi/round/email',
  placeholder: 'Status input field',
}

const FormIntegration = (args) => (
  <form className="flex flex-col gap-y-2" id="mds-icon-fi" name="mds-icon-fi">
    <mds-input {...args}></mds-input>
    <mds-button class="w-min" type="button" onClick={() => {
      const input = document.querySelector('input[name="inputto"]')
      const form = document.querySelector('form');
      const mdsInput = document.querySelector('mds-input');

      console.log('Input', input)
      console.log('Form', form)
      console.log('Form elements', form.elements)
      console.log('MdsInput', mdsInput)

      mdsInput.getInputElement().then((inputElement) => {
        console.log('MdsInput input element', inputElement)
      })

      input.addEventListener('input', function(e) { console.error('Input', e.target.value)})
      input.addEventListener('change', function(e) { console.warn('Change', e.target.value)})
      mdsInput.addEventListener('changeEvent', function(e) { console.info('MdsInput ChangeEvent', e.detail.value) })

      form.addEventListener('submit', function(e) { e.preventDefault(), console.info('Submitted', e)})
    }}>Trigger listener</mds-button>
  </form>
)

export const formIntegration = FormIntegration.bind({})
formIntegration.args = {
  placeholder: 'Mi integro col form!',
  name: 'inputto',
}
