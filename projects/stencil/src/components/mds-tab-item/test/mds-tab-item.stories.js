import React from 'react'
import faker from 'faker'
import MdsTabItem from '@component/mds-tab-item/mds-tab-item'

export default {
  title: 'UI / Tab / Tab Item',
  component: MdsTabItem,
  argTypes: {
    selected
  },
}

const Template = args =>
  <mds-tab-item {...args}>First Blood</mds-tab-item>

export const Default = Template.bind({})


export const selected = Template.bind({})
selected.args = {
  selected: true,
}
