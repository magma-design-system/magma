import React from 'react'
import MdsIcon from '../../../dist/collection/components/mds-icon/mds-icon'
import mggIconsDictionary from '@maggioli-design-system/icons/resources/mgg-icons.json'

export default {
  title: 'Design / Icon',
  component: MdsIcon,
  argTypes: {
    name: {
      type: { name: 'string', required: false },
      description: 'Truncates text inside the label or displays it in multiline if needed',
      options: Object.keys(mggIconsDictionary).sort(),
      control: { type: 'select' },
      defaultValue: 'status-warning',
    },
  },
}

const Template = args =>
  <mds-icon {...args}/>

export const Default = Template.bind({})

export const taliwindStyle = () =>
  <mds-icon class="text-5xl leading-none text-adjust-tone-05 bg-label-yellow-18 rounded p-2"/>
