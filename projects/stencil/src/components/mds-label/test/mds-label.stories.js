import React from 'react'
import faker from 'faker'
import MdsLabel from '@component/mds-label/mds-label'
import { typographyDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Label',
  component: MdsLabel,
  argTypes: {
    truncate: {
      type: { name: 'boolean', required: false },
      description: 'Truncates text inside the label or displays it in multiline if needed',
    },
    typography: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
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
  typography: 'label',
}

export const onClickDelete = Template.bind({})
onClickDelete.args = {
  onClickDelete: () => { console.log('hello') },
}

export const tailwindRadius = (args) =>
  <mds-label class="rounded-3xl" {...args}>{faker.lorem.paragraph()}</mds-label>

export const tailwindColor = (args) =>
  <mds-label class="bg-label-blue-06 text-label-blue-20" {...args}>{faker.lorem.paragraph()}</mds-label>

