import React from 'react'
import MdsIcon from '@component/mds-icon/mds-icon'
import mggIconsDictionary from '@maggioli-design-system/icons/resources/mgg-icons.json'

export default {
  title: 'Design / Icon',
  component: MdsIcon,
  argTypes: {
    name: {
      type: { name: 'string', required: false },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: Object.keys(mggIconsDictionary).sort(),
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-icon {...args}/>

export const Default = Template.bind({})

export const taliwindStyle = (args) =>
  <mds-icon {...args} class="text-5xl leading-none text-adjust-tone-05 bg-label-yellow-18 rounded p-2"/>
