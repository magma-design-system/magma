import { iconsDictionary } from '@dictionary/icon'
import {
  buttonSizeDictionary,
  buttonIconPositionDictionary,
} from '@dictionary/button'
import { h } from '@stencil/core'

export default {
  title: 'UI / Tab / Tab Item',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'The icon displayed in the tab item',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the horizontal position of the icon displayed in the tab item',
      options: buttonIconPositionDictionary,
    },
    selected: {
      type: { name: 'boolean' },
      description: 'Specifies if the tab item is selected or not',
    },
    size: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the size for the tab item',
      options: buttonSizeDictionary,
    },
  },
}

const Template = args =>
  <mds-tab-item {...args}>First Blood</mds-tab-item>

export const Default = Template.bind({})


export const Selected = Template.bind({})
Selected.args = {
  selected: true,
}
