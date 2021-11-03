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

export const Style = Template.bind({})
Style.args = {
  class: 'bg-adjust-tone-04',
}

<mds-hr class="bg-adjust-tone-04 p-4"/>
