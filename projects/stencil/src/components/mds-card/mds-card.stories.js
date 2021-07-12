import React from 'react'
import faker from 'faker'
import MdsCard from '../../../dist/collection/components/mds-card/mds-card'
import readme from './readme.md'

export default {
  title: 'Layout / Card',
  component: MdsCard,
  notes: readme,
}

const Template = args =>
  <mds-card {...args}>
    <mds-text>{faker.lorem.paragraph()}</mds-text>
    <mds-text>{faker.lorem.paragraph()}</mds-text>
    <mds-text>{faker.lorem.paragraph()}</mds-text>
  </mds-card>

export const Default = Template.bind({})
