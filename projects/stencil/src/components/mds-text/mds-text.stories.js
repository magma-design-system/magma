import React from 'react'
import faker from 'faker'
import MdsText from '../../../dist/collection/components/mds-text/mds-text'
import dictionary, { tags } from './defaults'

export default {
  title: 'Typography / Text',
  component: MdsText,
  argTypes: {
    tag: {
      description: 'Specifies the HTML tag of the element',
      options: tags,
      control: { type: 'select' },
    },
    type: {
      description: 'Specifies the typography of the element',
      options: Object.keys(dictionary),
      control: { type: 'select' },
    },
  },
}
const Template = args =>
  <mds-text {...args}>{faker.lorem.paragraph()}</mds-text>

export const Default = Template.bind({})

export const H1 = Template.bind({})
H1.args = {
  type: 'h1',
}

export const H2 = Template.bind({})
H2.args = {
  type: 'h2',
}

export const H3 = Template.bind({})
H3.args = {
  type: 'h3',
}

export const H4 = Template.bind({})
H4.args = {
  type: 'h4',
}

export const H5 = Template.bind({})
H5.args = {
  type: 'h5',
}

export const H6 = Template.bind({})
H6.args = {
  type: 'h6',
}

export const Action = Template.bind({})
Action.args = {
  type: 'action',
}

export const Paragraph = Template.bind({})
Paragraph.args = {
  type: 'paragraph',
}

export const Detail = Template.bind({})
Detail.args = {
  type: 'detail',
}

export const Caption = Template.bind({})
Caption.args = {
  type: 'caption',
}

export const Label = Template.bind({})
Label.args = {
  type: 'label',
}

export const Code = Template.bind({})
Code.args = {
  type: 'code',
}

export const Hack = Template.bind({})
Hack.args = {
  type: 'hack',
}
