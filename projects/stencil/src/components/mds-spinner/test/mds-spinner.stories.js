import React from 'react'
import MdsSpinner from '@component/mds-spinner/mds-spinner'
import { lokiDisabled } from '@test/loki-disabled'

export default {
  title: 'UI / Spinner',
  component: MdsSpinner,
}

const Template = args =>
  <mds-spinner {...args}/>

export const Default = Template.bind({})
Default.story = lokiDisabled
