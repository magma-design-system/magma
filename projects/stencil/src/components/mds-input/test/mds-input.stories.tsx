import { citiesDictionary } from '@fixture/cities'
import { themeStatusVariantDictionary } from '@dictionary/variant'
import { autoCompleteDictionary } from '@dictionary/autocomplete'
import { inputTextTypeDictionary, inputControlsLayoutDictionary, inputControlsIconDictionary } from '@dictionary/input'
import { typographyInputDictionary } from '@dictionary/typography'
import { iconsDictionary } from '@dictionary/icon'
import { h } from '@stencil/core'

import { MdsInputInterface } from '../mds-input'

// https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill

export default {
  title: 'Form / Input / Input',
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
    'control-decrease-label': {
      type: { name: 'string' },
      description: 'Specifies the label for control button decrease for component when type is number',
    },
    'control-increase-label': {
      type: { name: 'string' },
      description: 'Specifies the label for control button increase for component when type is number',
    },
    'controls-icon': {
      description: 'Specifies the icon type of the counter button when the input type is set to `number`',
      options: inputControlsIconDictionary,
      control: { type: 'select' },
    },
    'controls-layout': {
      description: 'Specifies the layout of the counter button when the input type is set to `number`',
      options: inputControlsLayoutDictionary,
      control: { type: 'select' },
    },
    datalist: {
      type: { name: 'array' },
      description: 'A list of search terms to be searched from the input field, it should be used with type="search" input',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'If true, the element is displayed as disabled',
    },
    'disabled-label': {
      type: { name: 'string' },
      description: 'The label for disabled state',
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
    'readOnly-label': {
      type: { name: 'string' },
      description: 'The label for readonly state',
    },
    required: {
      type: { name: 'boolean' },
      description: 'Specifies that the element must be filled out before submitting the form',
    },
    'required-label': {
      type: { name: 'string' },
      description: 'The label for required state',
    },
    step: {
      type: { name: 'string' },
      description: 'Specifies the interval between legal numbers in an input field',
    },
    tip: {
      type: { name: 'string' },
      description: 'Sets the message of the variant of the input field',
    },
    type: {
      type: { name: 'string' },
      description: 'Specifies the type of element',
      options: inputTextTypeDictionary,
      control: { type: 'select' },
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of element',
      options: typographyInputDictionary,
      control: { type: 'select' },
    },
    value: {
      type: { name: 'string' },
      description: 'Specifies the value of the element',
    },
    variant: {
      type: { name: 'string' },
      options: themeStatusVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the variant of the input field',
    },
  },
}

const Template = (args: MdsInputInterface) =>
  <mds-input {...args}></mds-input>

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Scrivi qualcosa',
}

export const AutoComplete = Template.bind({})
AutoComplete.args = {
  autocomplete: 'address',
  type: 'text',
  placeholder: 'Intestatario carta di credito',
}

export const AutoFocus = Template.bind({})
AutoFocus.args = {
  autofocus: true,
  placeholder: 'Auto focus input text',
}

export const ControlsLayout = Template.bind({})
ControlsLayout.args = {
  'controls-layout': 'horizontal',
  type: 'number',
  placeholder: 'Controls layout',
}

export const ControlsIcon = Template.bind({})
ControlsIcon.args = {
  'controls-icon': 'arithmetic',
  type: 'number',
  placeholder: 'Controls icon',
}

export const ControlsLabels = Template.bind({})
ControlsLabels.args = {
  'controls-icon': 'arrow',
  'controls-layout': 'horizontal',
  'control-increase-label': 'Alza',
  'control-decrease-label': 'Abbassa',
  type: 'number',
  placeholder: 'Controls labels',
}

export const Disabled = Template.bind({})
Disabled.args = {
  disabled: true,
  placeholder: 'Disabled',
}

export const DisabledLabel = Template.bind({})
DisabledLabel.args = {
  disabled: true,
  'disabled-label': 'not active',
  placeholder: 'Disabled',
}

export const Max = Template.bind({})
Max.args = {
  max: '3',
  type: 'number',
  value: '2',
}

export const Min = Template.bind({})
Min.args = {
  min: '3',
  type: 'number',
  value: '5',
}

export const Required = Template.bind({})
Required.args = {
  required: true,
  placeholder: 'This is a required field',
}

export const RequiredLabel = Template.bind({})
RequiredLabel.args = {
  required: true,
  'required-label': 'unavoidable',
  placeholder: 'Required label',
}

export const ReadOnly = Template.bind({})
ReadOnly.args = {
  readOnly: true,
  value: 'Read only text',
}

export const ReadOnlyLabel = Template.bind({})
ReadOnlyLabel.args = {
  readOnly: true,
  'readOnly-label': 'just read',
  value: 'Read only text',
}

export const Variant = Template.bind({})
Variant.args = {
  variant: 'error',
  placeholder: 'Status input field',
  tip: 'errore',
}

export const Tip = Template.bind({})
Tip.args = {
  placeholder: 'Scrivi qualcosa...',
  tip: 'input',
}

export const Search = Template.bind({})
Search.args = {
  datalist: citiesDictionary,
  type: 'search',
  placeholder: 'Search a city name...',
}

export const Icon = Template.bind({})
Icon.args = {
  icon: 'mi/round/email',
  placeholder: 'Status input field',
}

const FormIntegrationTemplate = (args: MdsInputInterface) => (
  <div class="grid gap-6">
    <form class="grid gap-4" id="mds-icon-fi" name="mds-icon-fi">
      <mds-input {...args}></mds-input>
      <mds-button class="w-min" type="button" role="submit" onClick={() => {
        const form = document.querySelector('form') as HTMLFormElement
        const span = document.querySelector('span.input-value') as HTMLSpanElement
        span.innerText = form['mds-input'].value !== '' ? form['mds-input'].value : 'Empty'
        form.addEventListener('submit', (e: SubmitEvent) => {
          e.preventDefault()
          console.info('Submitted', e)
        })
      }
      }>Check value</mds-button>
    </form>
    <mds-text variant="code">
      Input value taken from form element: <span class="input-value rounded text-tone-neutral-04 bg-tone-neutral-08 px-2">Empty</span>
    </mds-text>
  </div>
)

export const FormIntegration = FormIntegrationTemplate.bind({})
FormIntegration.args = {
  placeholder: 'Es: Hello world!',
  name: 'mds-input',
}
