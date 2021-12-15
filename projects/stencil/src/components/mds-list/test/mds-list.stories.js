import React from 'react'
import MdsList from '@component/mds-list/mds-list'

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
    <mds-list-item>Pane</mds-list-item>
    <mds-list-item>Acqua</mds-list-item>
    <mds-list-item>Pasta</mds-list-item>
  </mds-list>

export const Default = Template.bind({})
