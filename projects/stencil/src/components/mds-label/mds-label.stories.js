import React from 'react'
import faker from 'faker'
import MdsLabel from '../../../dist/collection/components/mds-label/mds-label'
import { typography as typographyDictionary } from '../../types-dictionary'

export default {
  title: 'UI / Label',
  component: MdsLabel,
  argTypes: {
    truncate: {
      type: { name: 'boolean', required: false },
      description: 'Truncates text inside the label or displays it in multiline if needed',
      defaultValue: true,
    },
    typography: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Truncates text inside the label or displays it in multiline if needed',
      defaultValue: undefined,
      options: typographyDictionary,
    },
  },
}
const Template = args =>
  <mds-label {...args}>{faker.lorem.paragraph()}</mds-label>

export const Default = Template.bind({})

export const truncate = Template.bind({})
truncate.args = {
  truncate: false,
}

export const typography = Template.bind({})
typography.args = {
  typography: 'detail',
}

export const onClickDelete = Template.bind({})
onClickDelete.args = {
  onClickDelete: () => { console.log('hello') },
}

export const tailwindRadius = (args) =>
  <mds-label class="rounded-3xl" {...args}>{faker.lorem.paragraph()}</mds-label>

export const tailwindColor = (args) =>
  <mds-label class="bg-label-blue-18 text-label-blue-04" {...args}>{faker.lorem.paragraph()}</mds-label>

export const tailwindPadding = (args) =>
  <mds-label class="px-4" {...args}>{faker.lorem.paragraph()}</mds-label>
tailwindPadding.args = {
  typography: 'h3',
}
