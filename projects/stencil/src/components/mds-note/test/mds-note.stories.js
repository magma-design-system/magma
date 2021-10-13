import React from 'react'
import faker from 'faker'
import MdsNote from '@component/mds-note/mds-note'
import { themeLabelVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Note',
  component: MdsNote,
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description: 'The name of the icon. The icon set is strictly realted to @maggioli-design-system/icons',
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the color variant for the element',
      options: themeLabelVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-note {...args}>
    <mds-text typography="detail">{faker.lorem.paragraph()}</mds-text>
  </mds-note>

const TemplateTitle = args =>
  <mds-note {...args}>
    <mds-text typography="h5" slot="title">{faker.lorem.sentence()}</mds-text>
    <mds-text typography="detail">{faker.lorem.paragraph()}</mds-text>
  </mds-note>

export const Default = Template.bind({})
export const Deletable = Template.bind({})
Deletable.args = {
  deletable: true,
}
export const Title = TemplateTitle.bind({})
