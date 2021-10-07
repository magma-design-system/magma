import React from 'react'
import MdsSpinner from '@component/mds-spinner/mds-spinner'

export default {
  title: 'UI / Spinner',
  component: MdsSpinner,
}

const Template = args =>
  <mds-spinner {...args}/>

export const Default = Template.bind({})
