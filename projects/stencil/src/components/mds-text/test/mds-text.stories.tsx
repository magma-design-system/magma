import { typographyDictionary, typographyVariationsDictionary } from '@dictionary/typography'
import { h } from '@stencil/core'
import { tagsDictionary } from '../meta/dictionary'

export default {
  title: 'Design / Typography',
  argTypes: {
    tag: {
      description: 'Specifies the HTML tag of the element',
      options: tagsDictionary,
      control: { type: 'select' },
    },
    truncate: {
      type: { name: 'boolean' },
      description: 'Specifies if the text shoud be truncated or should behave as a normal text',
    },
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographyDictionary,
      control: { type: 'select' },
    },
    variant: {
      description: 'Specifies the variant for `typography`',
      options: typographyVariationsDictionary,
      control: { type: 'select' },
    },
  },
}
const Template = args =>
  <mds-text {...args}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent dictum nec eros vitae dictum. Nunc lobortis pharetra lectus. Mauris egestas velit et mattis molestie. Sed risus purus, laoreet a massa in, tincidunt iaculis sem. Nam congue, ipsum viverra condimentum dignissim, mauris mi lacinia tortor, eu sodales magna augue a dui.</mds-text>

export const Default = Template.bind({})

export const Truncate = Template.bind({})
Truncate.args = {
  truncate: true,
}

export const VariantTitleAction = Template.bind({})
VariantTitleAction.args = {
  typography: 'action',
}

export const VariantTitleH1 = Template.bind({})
VariantTitleH1.args = {
  typography: 'h1',
}

export const VariantTitleH2 = Template.bind({})
VariantTitleH2.args = {
  typography: 'h2',
}

export const VariantTitleH3 = Template.bind({})
VariantTitleH3.args = {
  typography: 'h3',
}

export const VariantTitleH4 = Template.bind({})
VariantTitleH4.args = {
  typography: 'h4',
}

export const VariantTitleH5 = Template.bind({})
VariantTitleH5.args = {
  typography: 'h5',
}

export const VariantTitleH6 = Template.bind({})
VariantTitleH6.args = {
  typography: 'h6',
}

export const VariantInfoCaption = Template.bind({})
VariantInfoCaption.args = {
  typography: 'caption',
}

export const VariantInfoDetail = Template.bind({})
VariantInfoDetail.args = {
  typography: 'detail',
}

export const VariantInfoLabel = Template.bind({})
VariantInfoLabel.args = {
  typography: 'label',
}

export const VariantInfoOption = Template.bind({})
VariantInfoOption.args = {
  typography: 'option',
}

export const VariantInfoParagraph = Template.bind({})
VariantInfoParagraph.args = {
  typography: 'paragraph',
}

export const VariantInfoTip = Template.bind({})
VariantInfoTip.args = {
  typography: 'tip',
}

export const VariantReadCaption = Template.bind({})
VariantReadCaption.args = {
  typography: 'caption',
  variant: 'read',
}

export const VariantReadDetail = Template.bind({})
VariantReadDetail.args = {
  typography: 'detail',
  variant: 'read',
}

export const VariantReadParagraph = Template.bind({})
VariantReadParagraph.args = {
  typography: 'paragraph',
  variant: 'read',
}

export const VariantMonoCode = Template.bind({})
VariantMonoCode.args = {
  typography: 'code',
}

export const VariantMonoHack = Template.bind({})
VariantMonoHack.args = {
  typography: 'hack',
}
