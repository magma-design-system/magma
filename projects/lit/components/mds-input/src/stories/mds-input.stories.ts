import { html, nothing } from 'lit-html'
import { autoCompleteDictionary } from '../../../../../stencil/src/dictionary/autocomplete'
import { iconsDictionary } from '../../../../../stencil/src/dictionary/icon'
import { themeStatusVariantDictionary } from '../../../../../stencil/src/dictionary/variant'
import { inputTextTypeDictionary } from '../../../../../stencil/src/dictionary/input-text-type'

import '../mds-input'
import { InputTextType } from '../mds-input'

export default {
  title: 'Form / Input',
  argTypes: {
    autocomplete: {
      description:
        'Specifies whether the element should have autocomplete enabled',
      options: autoCompleteDictionary,
      control: { type: 'select' },
    },
    autofocus: {
      type: { name: 'boolean' },
      description:
        'Specifies that the element should automatically get focus when the page loads',
    },
    datalist: {
      type: { name: 'array' },
      description:
        'A list of search terms to be searched from the input field, it should be used with type="search" input',
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
      description:
        'Specifies the maximum number of characters allowed in an element',
    },
    min: {
      type: { name: 'number' },
      description: 'Specifies the minimum value',
    },
    minLength: {
      type: { name: 'number' },
      description:
        'Specifies the minimum number of characters allowed in an element',
    },
    name: {
      type: { name: 'string' },
      description:
        'Is needed to reference the form data after the form is submitted',
    },
    pattern: {
      type: { name: 'string' },
      description:
        'Specifies a regular expression that element\'s value is checked against',
    },
    placeholder: {
      type: { name: 'string' },
      description:
        'Specifies a short hint that describes the expected value of the element',
    },
    readOnly: {
      type: { name: 'boolean' },
      description: 'Specifies that the element is read-only',
    },
    required: {
      type: { name: 'boolean' },
      description:
        'Specifies that the element must be filled out before submitting the form',
    },
    step: {
      type: { name: 'string' },
      description:
        'Specifies the interval between legal numbers in an input field',
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

interface MdsInputArgs {
  placeholder?: string;
  required?: boolean;
  type: InputTextType;
  icon?: string;
  disabled?: boolean;
}

const Template = (args: MdsInputArgs) =>
  html`<mds-input
    .placeholder=${args.placeholder ?? nothing}
    .type=${args.type}
    .icon=${args.icon ?? nothing}
    ?disabled=${args.disabled ?? nothing}
    ?required=${args.required ?? nothing}
  ></mds-input>`

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Type something',
  type: 'text',
  required: true,
}
