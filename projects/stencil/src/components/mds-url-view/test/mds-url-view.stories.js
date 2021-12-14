import React from 'react'
import faker from 'faker'
import MdsUrlView from '@component/mds-url-view/mds-url-view'

import { loadingDictionary } from '@dictionary/loading'

const URLs = [
  'https://www.typeform.com/',
  'http://azumbrunnen.me/',
]

export default {
  title: 'UI / URL View',
  component: MdsUrlView,
  argTypes: {
    loading: {
      control: { type: 'select' },
      description: 'Specifies whether a browser should load an iframe immediately or to defer loading of images until some conditions are met.',
      options: loadingDictionary,
      type: { name: 'string', required: false },
    },
    src: {
      control: { type: 'select' },
      description: 'Specifies the URL to the web page',
      options: URLs,
      type: { name: 'string', required: true },
    },
  },
}

const Template = args =>
  <mds-modal opened={true} position="right">
    <mds-url-view class="max-w-lg w-full" slot="window" {...args}/>
  </mds-modal>

export const Default = Template.bind({})
Default = {
  loki: { skip: true },
  args: {
    src: 'http://azumbrunnen.me/',
  },
}
