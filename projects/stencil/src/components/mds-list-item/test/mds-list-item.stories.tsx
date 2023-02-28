import { typographyInfoDictionary, typographyReadingVariationsDictionary } from '@dictionary/typography'
import { iconsDictionary } from '@dictionary/icon'
import { h } from '@stencil/core'

export default {
  title: 'UI / List / List Item',
  argTypes: {
    icon: {
      type: { name: 'string', required: true },
      description: 'The name of the icon. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    typography: {
      type: { name: 'string', required: false },
      description: 'Specifies the typography of the element',
      options: typographyInfoDictionary,
      control: { type: 'select' },
    },
    variant: {
      description: 'Specifies the variant for `typography`',
      options: typographyReadingVariationsDictionary,
      control: { type: 'select' },
    },
  },
}
const Template = args =>
  <mds-list>
    <mds-list-item {...args}>Pane</mds-list-item>
    <mds-list-item {...args}>Acqua</mds-list-item>
    <mds-list-item {...args}>Pasta</mds-list-item>
  </mds-list>

export const Default = Template.bind({})
