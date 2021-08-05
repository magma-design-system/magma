import React from 'react'
import faker from 'faker'
import MdsPill from '@component/mds-pill/mds-pill'
import { typographySecondaryDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Pill',
  component: MdsPill,
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
  <mds-pill {...args}>{faker.animal.dog()}</mds-pill>

export const Default = Template.bind({})
export const tailwindStyle = () =>
  <mds-pill class="rounded-full text-adjust-tone bg-adjust-tone-04">{faker.animal.dog()}</mds-pill>

