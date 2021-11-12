import React from 'react'
import faker from 'faker'
import MdsBadge from '@component/mds-badge/mds-badge'
import { typographySecondaryDictionary } from '@dictionary/typography'
import { themeFullVariantDictionary, toneSimpleVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Badge',
  component: MdsBadge,
  argTypes: {
    tone: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Sets the tone of the color variant',
      options: toneSimpleVariantDictionary,
    },
    typography: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographySecondaryDictionary,
    },
    variant: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Sets the theme variant colors',
      options: themeFullVariantDictionary,
    },
  },
}

const Template = args =>
  <mds-badge {...args}>{faker.animal.dog()}</mds-badge>

export const Default = Template.bind({})


