import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'

export default {
  title: 'UI / Radial Menu / Radial Menu Item',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-radial-menu-item {...args}></mds-radial-menu-item>

export const Default = Template.bind({})
Default.args = {
  icon: 'mi/round/email',
}
