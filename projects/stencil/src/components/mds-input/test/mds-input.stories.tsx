import { citiesDictionary } from '@fixture/cities'
import { themeInputVariantDictionary } from '@dictionary/variant'
import { autoCompleteDictionary } from '@dictionary/autocomplete'
import {
  inputTextTypeDictionary,
  inputControlsLayoutDictionary,
  inputControlsIconDictionary,
} from '@dictionary/input'
import { typographyInputDictionary } from '@dictionary/typography'
import { iconsDictionary } from '@dictionary/icon'
import { h } from '@stencil/core'

import { MdsInputInterface } from '../mds-input'
import { useEffect } from 'react'

// https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill

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
    await: {
      type: { name: 'boolean' },
      description:
        'Specifies if the spinner icon is shown, replacing the icon if present',
    },
    'controls-icon': {
      description:
        'Specifies the icon type of the counter button when the input type is set to `number`',
      options: inputControlsIconDictionary,
      control: { type: 'select' },
    },
    'controls-layout': {
      description:
        'Specifies the layout of the counter button when the input type is set to `number`',
      options: inputControlsLayoutDictionary,
      control: { type: 'select' },
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
    mic: {
      type: { name: 'boolean' },
      description: 'Toggles text recognition',
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
      options: themeInputVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the variant of the input field',
    },
  },
}

const Template = (args: MdsInputInterface) => <mds-input {...args}></mds-input>

const TemplateLanguage = (args: MdsInputInterface) => (
  <div class="grid gap-400">
    <mds-input {...args}></mds-input>
    <div class="grid gap grid-cols-3">
      <mds-pref>
        <mds-pref-language>
          <mds-pref-language-item code="it"></mds-pref-language-item>
          <mds-pref-language-item code="en"></mds-pref-language-item>
          <mds-pref-language-item code="el"></mds-pref-language-item>
          <mds-pref-language-item code="es"></mds-pref-language-item>
          <mds-pref-language-item code="ja"></mds-pref-language-item>
        </mds-pref-language>
      </mds-pref>
    </div>
  </div>
)

export const Default = {
  render: Template,

  args: {
    placeholder: 'Scrivi qualcosa',
  },
}

export const AutoComplete = {
  render: Template,

  args: {
    autocomplete: 'address',
    type: 'text',
    placeholder: 'Intestatario carta di credito',
  },
}

export const AutoFocus = {
  render: Template,

  args: {
    autofocus: true,
    placeholder: 'Auto focus input text',
  },
}

export const ControlsLayout = {
  render: Template,

  args: {
    'controls-layout': 'horizontal',
    type: 'number',
    placeholder: 'Controls layout',
  },
}

export const ControlsIcon = {
  render: Template,

  args: {
    'controls-icon': 'arithmetic',
    type: 'number',
    placeholder: 'Controls icon',
  },
}

export const Disabled = {
  render: Template,

  args: {
    disabled: true,
    placeholder: 'Disabled',
  },
}

export const Max = {
  render: Template,

  args: {
    max: '3',
    type: 'number',
    value: '2',
  },
}

export const MaxLength = {
  render: Template,

  args: {
    maxlength: 128,
    type: 'text',
    value: 'Hello',
  },
}

export const Min = {
  render: Template,

  args: {
    min: '3',
    type: 'number',
    value: '5',
  },
}

export const MinLength = {
  render: Template,

  args: {
    MinLength: 5,
    type: 'text',
    value: 'Hello',
  },
}

export const Required = {
  render: Template,

  args: {
    required: true,
    placeholder: 'This is a required field',
  },
}

export const ReadOnly = {
  render: Template,

  args: {
    readOnly: true,
    value: 'Read only text',
  },
}

export const Variant = {
  render: Template,

  args: {
    variant: 'error',
    placeholder: 'Status input field',
    tip: 'errore',
  },
}

export const Tip = {
  render: Template,

  args: {
    placeholder: 'Scrivi qualcosa...',
    tip: 'input',
  },
}

export const Password = {
  render: Template,

  args: {
    type: 'password',
    placeholder: 'Insert a pasword',
  },
}

export const Placeholder = {
  render: Template,

  args: {
    placeholder: 'Es: change this placeholder',
  },
}

const TemplateSearch = (args: MdsInputInterface) => {
  useEffect(() => {
    document.querySelector('mds-input')!.datalist = args.datalist
  })
  return <mds-input {...args}></mds-input>
}

export const Search = {
  render: TemplateSearch,

  args: {
    datalist: citiesDictionary,
    type: 'search',
    placeholder: 'Search a city name...',
  },
}

export const Icon = {
  render: Template,

  args: {
    icon: 'mi/round/email',
    placeholder: 'Status input field',
  },
}

export const TestLanguageChange = {
  render: TemplateLanguage,

  args: {
    icon: 'mi/round/email',
    readonly: true,
    placeholder: 'Status input field',
  },
}

export const VariantAi = {
  render: Template,

  args: {
    variant: 'ai',
    placeholder: 'Es: Come si cresce un bovaro del bernese?',
  },
}

export const TextRecognition = {
  render: Template,

  args: {
    variant: 'ai',
    mic: true,
    placeholder: 'Es: Come si cresce un bovaro del bernese?',
  },
}

const FormIntegrationTemplate = (args: MdsInputInterface) => {
  return (
    <div class="grid gap-600">
      <form
        class="grid gap-400"
        id="mds-icon-fi"
        name="mds-icon-fi"
        onSubmit={(e: SubmitEvent) => {
          e.preventDefault()
          console.info('Submitted', e)
        }}
      >
        <mds-input {...args}></mds-input>
        <mds-button
          class="w-min"
          type="submit"
          onClick={(e: MouseEvent) => {
            e.preventDefault()
            const form = document.querySelector('form') as HTMLFormElement
            const span = document.querySelector(
              'span.input-value',
            ) as HTMLSpanElement
            span.innerText =
              form['mds-input'].value !== ''
                ? form['mds-input'].value
                : 'Empty'
          }}
        >
          Check value
        </mds-button>
      </form>
      <mds-text variant="code">
        Input value taken from form element:{' '}
        <span class="inline-flex input-value rounded text-tone-neutral-01 bg-tone-neutral-08 px-200 py-50">
          Empty
        </span>
      </mds-text>
    </div>
  )
}

export const FormIntegration = {
  render: FormIntegrationTemplate,

  args: {
    placeholder: 'Es: Hello world!',
    name: 'mds-input',
  },
}
