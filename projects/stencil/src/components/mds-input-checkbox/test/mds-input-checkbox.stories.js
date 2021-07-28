import React from 'react'
import MdsCheckbox from '@component/mds-input-checkbox/mds-input-checkbox'
import faker from 'faker'
import { typographyDictionary } from '@dictionary/typography'
import mggIconsDictionary from '@maggioli-design-system/icons/resources/mgg-icons.json'

export default {
  title: 'Form / Checkbox',
  component: MdsCheckbox,
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
      options: Object.keys(mggIconsDictionary).sort(),
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
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographyDictionary,
      control: { type: 'select' },
    },
    value: {
      type: { name: 'string', required: true },
      description: 'Specifies the value of the input element',
    },
  },
}

const Template = args =>
  <mds-input-checkbox {...args}>{faker.lorem.paragraph()}</mds-input-checkbox>

export const Default = Template.bind({})
Default.args = {
  name: 'checkbox-name',
}

export const autoFocus = Template.bind({})
autoFocus.args = {
  autofocus: true,
  name: 'checkbox-name',
}

export const tailwindStyle = args =>
  <div>
    <mds-input-checkbox class="hover:bg-adjust-tone-20 p-4 rounded-md transition-colors duration-150 ease-out-quad" {...args}>{faker.lorem.paragraph()}</mds-input-checkbox>
  </div>
