import React from 'react'
import MdsDownload from '@component/mds-download/mds-download'
import MdsIcon from '@component/mds-icon/mds-icon'
import { extensionsDictionary } from '@component/mds-download/dictionary'
import mggIconsDictionary from '@maggioli-design-system/icons/resources/mgg-icons.json'

export default {
  title: 'UI / Download',
  component: MdsDownload,
  subcomponents: { MdsIcon },
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
  <mds-download {...args}/>

export const Default = Template.bind({})

