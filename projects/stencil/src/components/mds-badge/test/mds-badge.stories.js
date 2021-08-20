import React from 'react'
import faker from 'faker'
import MdsBadge from '@component/mds-badge/mds-badge'
import { typographySecondaryDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Badge',
  component: MdsBadge,
  argTypes: {
    typography: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographySecondaryDictionary,
    },
  },
}

const Template = args =>
  <mds-badge {...args}>{faker.animal.dog()}</mds-badge>

export const Default = Template.bind({})
export const tailwindStyle = () =>
  <mds-badge class="rounded-full text-adjust-tone bg-adjust-tone-04">{faker.animal.dog()}</mds-badge>

