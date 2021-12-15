import React from 'react'
import MdsTabItem from '@component/mds-tab-item/mds-tab-item'
import { iconsDictionary } from '@dictionary/icon'
import {
  buttonSizeDictionary,
  buttonIconPositionDictionary,
} from '@dictionary/button'

export default {
  title: 'UI / Tab / Tab Item',
  component: MdsTabItem,
  argTypes: {
    icon: {
      type: { name: 'string', required: true },
      description: 'The icon displayed in the tab item',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Specifies the horizontal position of the icon displayed in the tab item',
      options: buttonIconPositionDictionary,
    },
    selected: {
      type: { name: 'boolean', required: false },
      description: 'Specifies if the tab item is selected or not',
    },
    size: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Specifies the size for the tab item',
      options: buttonSizeDictionary,
    },
  },
}

const Template = args =>
  <mds-tab-item {...args}>First Blood</mds-tab-item>

export const Default = Template.bind({})


export const selected = Template.bind({})
selected.args = {
  selected: true,
}
