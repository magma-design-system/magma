import { h } from '@stencil/core'
import { iconsDictionary, mggIconsDictionary } from '@dictionary/icon'

export default {
  title: 'UI / Help',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-text>
    We are available 24/7!
    <mds-help {...args} class="ml-100">
      Well, maybe it's more a 24/5, because we are colsed on saturday and sunday.
    </mds-help>
  </mds-text>

export const Default = Template.bind({})
export const CustomIcon = Template.bind({})
CustomIcon.args = {
  icon: 'mi/baseline/warning',
}
