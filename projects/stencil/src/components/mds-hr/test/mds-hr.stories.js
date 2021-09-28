import React, { Fragment } from 'react'
import faker from 'faker'
import MdsHr from '@component/mds-hr/mds-hr'

export default {
  title: 'UI / Hr',
  component: MdsHr,
}

const Template = args =>
  <mds-hr {...args}/>

export const Default = Template.bind({})
Default.args = {
  icon: 'home-group',
}
