import React from 'react'
import MdsIcon from '@component/mds-icon/mds-icon'
import { iconsDictionary } from '@dictionary/icon'

export default {
  title: 'Design / Icon',
  component: MdsIcon,
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-icon {...args}/>

export const Default = Template.bind({})
Default.args = {
  name: 'mdi/alien',
  class: 'fill-label-blue-05'
}
