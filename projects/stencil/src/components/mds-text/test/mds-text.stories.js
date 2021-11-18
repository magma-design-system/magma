import React from 'react'
import faker from 'faker'
import MdsText from '@component/mds-text/mds-text'
import { typographyDictionary } from '@dictionary/typography'
import { tagsDictionary } from '../meta/dictionary'

export default {
  title: 'Design / Typography',
  component: MdsText,
  argTypes: {
    tag: {
      description: 'Specifies the HTML tag of the element',
      options: tagsDictionary,
      control: { type: 'select' },
    },
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographyDictionary,
      control: { type: 'select' },
    },
  },
}
const Template = args =>
  <mds-text {...args}>{faker.lorem.paragraph()}</mds-text>

export const Default = Template.bind({})

export const H1 = Template.bind({})
H1.args = {
  typography: 'h1',
}

export const H2 = Template.bind({})
H2.args = {
  typography: 'h2',
}

export const H3 = Template.bind({})
H3.args = {
  typography: 'h3',
}

export const H4 = Template.bind({})
H4.args = {
  typography: 'h4',
}

export const H5 = Template.bind({})
H5.args = {
  typography: 'h5',
}

export const H6 = Template.bind({})
H6.args = {
  typography: 'h6',
}

export const Action = Template.bind({})
Action.args = {
  typography: 'action',
}

export const Paragraph = Template.bind({})
Paragraph.args = {
  typography: 'paragraph',
}

export const Detail = Template.bind({})
Detail.args = {
  typography: 'detail',
}

export const Caption = Template.bind({})
Caption.args = {
  typography: 'caption',
}

export const Label = Template.bind({})
Label.args = {
  typography: 'label',
}

export const Option = Template.bind({})
Option.args = {
  typography: 'option',
}

export const Code = Template.bind({})
Code.args = {
  typography: 'code',
}

export const Hack = Template.bind({})
Hack.args = {
  typography: 'hack',
}
