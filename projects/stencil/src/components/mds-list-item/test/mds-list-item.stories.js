import React from 'react'
import faker from 'faker'
import MdsList from '@component/mds-list/mds-list'

export default {
  title: 'UI / List item',
  component: MdsList,
  argTypes: {
    type: {
      type: { name: 'string', required: false },
      description: 'Defines if the list is ordered or unordered',
    },
  },
}
const Template = args =>
  <mds-list {...args}>
    <mds-list-item icon="map-marker">{faker.lorem.paragraph()}</mds-list-item>
    <mds-list-item icon="map-marker">{faker.lorem.paragraph()}</mds-list-item>
    <mds-list-item icon="map-marker">{faker.lorem.paragraph()}</mds-list-item>
  </mds-list>

export const Default = Template.bind({})
