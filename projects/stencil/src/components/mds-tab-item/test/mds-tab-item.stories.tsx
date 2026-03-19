import { iconsDictionary } from '@dictionary/icon'
import {
  buttonSizeDictionary,
  buttonIconPositionDictionary,
} from '@dictionary/button'
import { h } from '@stencil/core'

export default {
  title: 'UI / Tab / Tab Item',
  argTypes: {
    disabled: {
      type: { name: 'boolean' },
      description: 'Specifies if the tab item is disabled or not',
    },
    icon: {
      type: { name: 'string' },
      description: 'The icon displayed in the tab item',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string' },
      control: { type: 'select' },
      description:
        'Specifies the horizontal position of the icon displayed in the tab item',
      options: buttonIconPositionDictionary,
    },
    selected: {
      type: { name: 'boolean' },
      description: 'Specifies if the tab item is selected or not',
    },
    label: {
      type: { name: 'string' },
      description: 'The label of the tab item',
    },
    size: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the size for the tab item',
      options: buttonSizeDictionary,
    },
  },
}

const Template = args => <mds-tab-item {...args} label="First Blood"></mds-tab-item>

export const Default = {
  render: Template,
}

export const Selected = {
  render: Template,

  args: {
    selected: true,
  },
}

export const Disabled = {
  render: Template,

  args: {
    disabled: true,
  },
}
