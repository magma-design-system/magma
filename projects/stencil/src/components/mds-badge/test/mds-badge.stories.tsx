import { h } from '@stencil/core'
import {
  typographyLabelDictionary,
} from '@type/typography'
import { themeFullVariantDictionary } from '@type/variant'
import { toneSmartVariantDictionary } from '@type/tone'

export default {
  title: 'UI / Badge',
  argTypes: {
    tone: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the tone of the color variant',
      options: toneSmartVariantDictionary,
    },
    typography: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographyLabelDictionary,
    },
    variant: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the theme variant colors',
      options: themeFullVariantDictionary,
    },
  },
}

const Template = args => <mds-badge {...args}>bovaro del bernese</mds-badge>

export const Default = {
  render: Template,

  args: {
    tone: 'strong',
    variant: 'violet',
  },
}
