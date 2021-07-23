import React from 'react'
import MdsIcon from '@component/mds-icon/mds-icon'
import faker from 'faker'
import mggIconsDictionary from '@maggioli-design-system/icons/resources/mgg-icons.json'
const iconsDictionary = Object.keys(mggIconsDictionary).sort()

const getIcon = () =>
  iconsDictionary[faker.datatype.number(iconsDictionary.length - 1)]

export default {
  title: 'Design / Icon',
  component: MdsIcon,
  argTypes: {
    name: {
      type: { name: 'string', required: false },
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
  name: getIcon()
}

export const taliwindStyle = (args) =>
  <mds-icon name={getIcon()} {...args} class="text-5xl leading-none text-adjust-tone-05 bg-label-yellow-18 rounded p-2"/>
