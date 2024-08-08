import { citiesDictionary } from '@fixture/cities'
import { autoCompleteDictionary } from '@dictionary/autocomplete'
import { themeStatusVariantDictionary } from '@dictionary/variant'
import { h } from '@stencil/core'

const cities = {}
citiesDictionary.map((element, index) => { cities[index] = element } )

export default {
  title: 'Form / Select',
  argTypes: {
    value: {
      type: { name: 'string' },
      description: 'The selected value of the select',
    },
    autocomplete: {
      description: 'Specifies whether the element should have autocomplete enabled',
      options: autoCompleteDictionary,
      control: { type: 'select' },
    },
    autofocus: {
      type: { name: 'boolean' },
      description: 'Specifies that the element should automatically get focus when the page loads',
    },
    placeholder: {
      type: { name: 'string' },
      description: 'Specifies a short hint that describes the expected value of the element',
    },
    required: {
      type: { name: 'boolean' },
      description: 'Specifies that the element must be filled out before submitting the form',
    },
    'required-label': {
      type: { name: 'string' },
      description: 'The label for required state',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'If true, the element is displayed as disabled',
    },
    'disabled-label': {
      type: { name: 'string' },
      description: 'The label for disabled state',
    },
    multiple: {
      type: { name: 'boolean' },
      description: 'If true, the element allows multiple options to be selected in the list',
    },
    size: {
      type: { name: 'number' },
      description: 'When multiple is set to true, represents the number of rows in the list that should be visible',
    },
    variant: {
      type: { name: 'string' },
      options: themeStatusVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the variant of the component',
    },
  },
}

const Template = args =>
  <mds-input-select {...args}>
    <option value="1">First contact</option>
    <option value="2">Second impact</option>
    <option value="3">The Third Man</option>
    <option value="4">The Fourth Emendament</option>
  </mds-input-select>

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Seleziona un film...',
}

export const Multiple = Template.bind({})
Multiple.args = {
  multiple: true,
}
