import React from 'react'
import MdsTabBarItem from '@component/mds-tab-bar-item/mds-tab-bar-item'

import { typographySmallerDictionary } from '@dictionary/typography'

export default {
  title: 'UI / Tab Bar / Tab Bar Item',
  component: MdsTabBarItem,
  argTypes: {
    selected: {
      type: { name: 'boolean' },
      description: 'Specifies if the component item is selected or not',
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographySmallerDictionary,
      control: { type: 'select' },
    },
  }
}

const Template = args =>
  <mds-tab-bar>
    <mds-tab-bar-item {...args} icon="barley" selected>First Blood</mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="crown">Second Impact</mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="timer">The Third Reich</mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="account-balance">The Fantastic Four</mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="account-hard-hat">The Fifth Element</mds-tab-bar-item>
  </mds-tab-bar>

export const Default = Template.bind({})
