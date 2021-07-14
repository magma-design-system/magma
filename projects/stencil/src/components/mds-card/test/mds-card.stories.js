import React from 'react'
import faker from 'faker'
import MdsCard from '@component/mds-card/mds-card'

export default {
  title: 'Layout / Card',
  component: MdsCard,
}

const Template = args =>
  <mds-card {...args}>
    <mds-text>{faker.lorem.paragraph()}</mds-text>
    <mds-text>{faker.lorem.paragraph()}</mds-text>
    <mds-text>{faker.lorem.paragraph()}</mds-text>
  </mds-card>

export const Default = Template.bind({})

export const tailwindStyle = () => <mds-card class="gap-4 p-6 shadow-xl">
  <mds-text class="bg-status-info-18 text-status-info-05 -mx-6 -mt-6 p-6">{faker.lorem.paragraph()}</mds-text>
  <mds-text>{faker.lorem.paragraph()}</mds-text>
  <mds-text>{faker.lorem.paragraph()}</mds-text>
</mds-card>
