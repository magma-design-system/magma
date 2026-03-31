import { h } from '@stencil/core'
import { typographyTechnicalDictionary } from '@type/typography'
import { themeVariantDictionary } from '@type/variant'
import { iconsDictionary } from '@type/icon'

export default {
  title: 'UI / Radial Progress',
  argTypes: {
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographyTechnicalDictionary,
      control: { type: 'select' },
    },
    progress: {
      type: { name: 'number' },
      control: { type: 'range', step: 0.01, min: 0, max: 1 },
      description: 'Specifies the progress of the radial progress',
    },
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon of the element',
      control: { type: 'select' },
      options: iconsDictionary,
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the element',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
    width: {
      description: 'Just for testing purposes',
      control: { type: 'range', defaultValue: 48, min: 16, max: 328, step: 1 },
      type: { name: 'number' },
    },
  },
}

const Template = args => (
  <mds-radial-progress {...args} style={{ width: `${args.width}px` }}></mds-radial-progress>
)

export const Default = {
  render: Template,
  args: {
    width: 48,
    progress: 0.65,
  },
}
