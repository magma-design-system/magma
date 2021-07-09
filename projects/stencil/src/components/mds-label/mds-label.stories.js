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

export const tailwindRadius = () =>
  <mds-label class="rounded-3xl">{faker.lorem.paragraph()}</mds-label>

export const tailwindFont = () =>
  <mds-label class="text-secondary-detail">{faker.lorem.paragraph()}</mds-label>

export const tailwindColor = () =>
  <mds-label class="bg-label-blue-17 text-label-blue-04">{faker.lorem.paragraph()}</mds-label>

export const test = () =>
  <div>
    <mds-icon name="action-close" class="flex-shrink-0 ml-1 bg-adjust-tone rounded-full w-5 h-5"/>
    <mds-label class="bg-label-blue-17 text-label-blue-04">{faker.lorem.paragraph()}</mds-label>
  </div>
