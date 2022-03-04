import React from 'react'
import MdsIconSvg from '@component/mds-icon-svg/mds-icon-svg'

export default {
  title: 'Design / Icon / SVG',
  component: MdsIconSvg,
  argTypes: {
    name: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: ['/home/apruccoli/Test/svg/accessibility.svg'],
      control: { type: 'select' },
    },
  },
}

const Template = (args) => <mds-icon-svg {...args} />

export const Default = Template.bind({})
Default.args = {
  name: 'mdi/alien',
  class: 'fill-label-amaranth-05',
}
