import React from 'react'
import faker from 'faker'
import MdsList from '../../../dist/collection/components/mds-list/mds-list'
import { typography as typographyDictionary } from '../../types-dictionary'

export default {
  title: 'UI / List',
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
    <mds-list-item>{faker.lorem.paragraph()}</mds-list-item>
    <mds-list-item>{faker.lorem.paragraph()}</mds-list-item>
    <mds-list-item>{faker.lorem.paragraph()}</mds-list-item>
  </mds-list>

export const Default = Template.bind({})
