import { h } from '@stencil/core'
import { typographySecondaryDictionary } from '@dictionary/typography'
import { themeFullVariantDictionary, toneSimpleVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Badge',
  argTypes: {
    tone: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the tone of the color variant',
      options: toneSimpleVariantDictionary,
    },
    typography: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographySecondaryDictionary,
    },
    variant: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the theme variant colors',
      options: themeFullVariantDictionary,
    },
  },
}

const Template = args =>
  <mds-badge {...args}>bovaro del bernese</mds-badge>

export const Default = Template.bind({})
Default.args = {
  tone: 'strong',
  variant: 'violet',
}

