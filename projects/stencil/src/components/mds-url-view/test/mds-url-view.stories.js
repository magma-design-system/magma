import React from 'react'
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
    domain: {
      description: 'Specifies if domain is visible on header',
      type: { name: 'boolean' },
    },
    loading: {
      control: { type: 'select' },
      description: 'Specifies whether a browser should load an iframe immediately or to defer loading of images until some conditions are met.',
      options: loadingDictionary,
      type: { name: 'string' },
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
  <mds-modal opened={true} position="right" class="z-50">
    <mds-url-view class="max-w-lg w-full" slot="window" {...args}/>
  </mds-modal>

export let Default = Template.bind({})
Default.args = {
  src: 'http://azumbrunnen.me/',
}
Default.story = {
  parameters: {
    loki: { skip: true },
  },
}

export let Domain = Template.bind({})
Domain.args = {
  domain: true,
}
