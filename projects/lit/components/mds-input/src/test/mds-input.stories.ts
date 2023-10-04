import { html, nothing } from 'lit-html'
import { AutocompleteType } from '@stencil-type/autocomplete'
import { InputTextType } from '@stencil-type/input-text-type'
import { autoCompleteDictionary } from '@stencil-dictionary/autocomplete'
import { iconsDictionary } from '@stencil-dictionary/icon'
import { inputTextTypeDictionary } from '@stencil-dictionary/input-text-type'
import { themeStatusVariantDictionary } from '@stencil-dictionary/variant'
import { ThemeStatusVariantType } from '@stencil-type/variant'

import '../../dist/mds-input'

import clsx from 'clsx'

export default {
  title: 'Form / Input',
  argTypes: {
    autocomplete: {
      label:
        'Specifies whether the element should have autocomplete enabled',
      options: autoCompleteDictionary,
      control: { type: 'select' },
    },
    autofocus: {
      type: { name: 'boolean' },
      label:
        'Specifies that the element should automatically get focus when the page loads',
    },
    datalist: {
      type: { name: 'array' },
      label:
        'A list of search terms to be searched from the input field, it should be used with type="search" input',
    },
    disabled: {
      type: { name: 'boolean' },
      label: 'If true, the element is displayed as disabled',
    },
    icon: {
      control: { type: 'select' },
      label: 'An icon displayed at the right of the input',
      options: iconsDictionary,
      type: { name: 'string' },
    },
    max: {
      type: { name: 'number' },
      label: 'Specifies the maximum value',
    },
    maxLength: {
      type: { name: 'number' },
      label:
        'Specifies the maximum number of characters allowed in an element',
    },
    min: {
      type: { name: 'number' },
      label: 'Specifies the minimum value',
    },
    minLength: {
      type: { name: 'number' },
      label:
        'Specifies the minimum number of characters allowed in an element',
    },
    name: {
      type: { name: 'string' },
      label:
        'Is needed to reference the form data after the form is submitted',
    },
    pattern: {
      type: { name: 'string' },
      label:
        'Specifies a regular expression that element\'s value is checked against',
    },
    placeholder: {
      type: { name: 'string' },
      label:
        'Specifies a short hint that describes the expected value of the element',
    },
    readOnly: {
      type: { name: 'boolean' },
      label: 'Specifies that the element is read-only',
    },
    required: {
      type: { name: 'boolean' },
      label:
        'Specifies that the element must be filled out before submitting the form',
    },
    step: {
      type: { name: 'string' },
      label:
        'Specifies the interval between legal numbers in an input field',
    },
    tabindex: {
      type: { name: 'number' },
      label: 'Sets the tabindex of this element',
    },
    tip: {
      type: { name: 'string' },
      label: 'Sets the message of the tip of the input field',
    },
    type: {
      type: { name: 'string', required: true },
      label: 'Specifies the type of element',
      options: inputTextTypeDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      options: themeStatusVariantDictionary,
      control: { type: 'select' },
      label: 'Sets the variant of the input field',
    },
    value: {
      type: { name: 'string' },
      label: 'Specifies the value of the element',
    },
  },
}

interface MdsInputArgs {
  placeholder?: string;
  type: InputTextType;
  required?: boolean;
  autocomplete?: AutocompleteType;
  autofocus?: boolean;
  datalist?: string[];
  disabled?: boolean;
  icon?: string;
  max?: number;
  maxLength?: number;
  min?: number;
  minLength?: number;
  name?: string;
  pattern?: string;
  readOnly?: boolean;
  step?: string;
  variant?: ThemeStatusVariantType;
  tip?: string;
  value?: string;
  tabindex?: number;
}

const Template = (args: MdsInputArgs) =>
  html`<mds-input
    class=${clsx('input', args.icon && 'has-icon')}
    list=${args.datalist ? 'datalist' : nothing}
    .autoComplete=${args.autocomplete ?? nothing}
    .max=${args.max ?? nothing}
    .maxLength=${args.maxLength ?? nothing}
    .min=${args.min ?? nothing}
    .minLength=${args.minLength ?? nothing}
    .name=${args.name ?? nothing}
    .type=${args.type ?? nothing}
    .pattern=${args.pattern ?? nothing}
    .placeholder=${args.placeholder ?? nothing}
    .step=${args.step ?? nothing}
    .tabindex=${args.tabindex ?? nothing}
    .tip=${args.tip ?? nothing}
    .value=${args.value ?? nothing}
    .variant=${args.variant ?? nothing}
    ?autoFocus=${args.autofocus ?? nothing}
    ?disabled=${args.disabled ?? nothing}
    ?readOnly=${args.readOnly ?? nothing}
    ?required=${args.required ?? nothing}
  ></mds-input>
  ${args.datalist && args.datalist.length > 0 ? html`
    <datalist id="datalist" class="datalist">
      ${args.datalist.map((element: string) => html`<option value="${element}" />`)}
    </datalist>
  ` : ''}`

export const Default = Template.bind({})
// Default.args = {
//   placeholder: 'Type something',
//   type: 'text',
//   required: true,
// }
