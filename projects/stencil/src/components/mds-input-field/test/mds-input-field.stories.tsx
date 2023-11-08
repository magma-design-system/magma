import { autoCompleteDictionary } from '@dictionary/autocomplete'
import { themeStatusVariantDictionary } from '@dictionary/variant'
import { inputTextTypeDictionary, inputControlsLayoutDictionary, inputControlsIconDictionary } from '@dictionary/input'
import { iconsDictionary } from '@dictionary/icon'
import { typographyInputDictionary } from '@dictionary/typography'
import { validationModelDictionary } from '../meta/dictionary'
import { h } from '@stencil/core'
import { MdsInputFieldInterface } from '../mds-input-field'

export default {
  title: 'Form / Input / Input Field',
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
    label: {
      type: { name: 'string' },
      description: 'Display a text on the top of the input text field',
    },
    max: {
      type: { name: 'number' },
      description: 'Specifies the maximum value',
    },
    maxLength: {
      type: { name: 'number' },
      description: 'Specifies the maximum number of characters allowed in an element',
    },
    message: {
      type: { name: 'string' },
      description: 'Display a message at the bottom of the input text field',
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
    variant: {
      type: { name: 'string' },
      options: themeStatusVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the variant of the input field',
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
    validate: {
      type: { name: 'string' },
      description: 'Specifies the type of model data to be automatically validated',
      options: validationModelDictionary,
      control: { type: 'select' },
    },
    value: {
      type: { name: 'string' },
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

export const AutoComplete = Template.bind({})
AutoComplete.args = {
  label: 'Questo è un label',
  autocomplete: 'address',
  type: 'text',
  placeholder: 'Intestatario carta di credito',
}

export const AutoFocus = Template.bind({})
AutoFocus.args = {
  label: 'Questo è un label',
  autofocus: true,
  placeholder: 'Auto focus',
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

export const Disabled = Template.bind({})
Disabled.args = {
  label: 'Questo è un label',
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
  label: 'Questo è un label',
  max: '3',
  type: 'number',
  value: '2',
}

export const Min = Template.bind({})
Min.args = {
  label: 'Questo è un label',
  min: '3',
  type: 'number',
  value: '5',
}

export const Required = Template.bind({})
Required.args = {
  label: 'Questo è un label',
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
  label: 'Questo è un label',
  readOnly: true,
  value: 'This is a read only field',
}

export const ReadOnlyLabel = Template.bind({})
ReadOnlyLabel.args = {
  readOnly: true,
  'readOnly-label': 'just read',
  value: 'Read only text',
}

export const Message = Template.bind({})
Message.args = {
  label: 'Questo è un label',
  placeholder: 'Placeholder text...',
  message: 'This is a field with a message',
}

export const Variant = Template.bind({})
Variant.args = {
  label: 'Questo è un label',
  placeholder: 'Placeholder text...',
  variant: 'error',
  value: 'Input field text',
  tip: 'errore',
  message: 'This is a field with a message',
}

export const Icon = Template.bind({})
Icon.args = {
  icon: 'mi/baseline/check-circle',
  label: 'Questo è un label',
  placeholder: 'This is a field',
}

export const Validate = Template.bind({})
Validate.args = {
  validate: 'cf',
  label: 'inserisci il tuo codice fiscale',
  placeholder: 'Es: MRCRSS83B21D704L',
}

const FormIntegrationTemplate = (args: MdsInputFieldInterface) => (
  <div class="grid gap-6">
    <form class="grid gap-4" id="mds-icon-fi" name="mds-icon-fi">
      <mds-input-field {...args}></mds-input-field>
      <mds-button class="w-min" type="button" role="submit" onClick={() => {
        const form = document.querySelector('form') as HTMLFormElement
        const span = document.querySelector('span.input-value') as HTMLSpanElement
        span.innerText = form['mds-input-field'].value !== '' ? form['mds-input-field'].value : 'Empty'
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
  label: 'Write something',
  placeholder: 'Es: Hello world!',
  name: 'mds-input-field',
}
