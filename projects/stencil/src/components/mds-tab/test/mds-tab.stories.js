import React from 'react'
import faker from 'faker'
import MdsTab from '@component/mds-tab/mds-tab'

export default {
  title: 'UI / Tab',
  component: MdsTab,
  argTypes: {},
}

const Template = args =>
  <mds-tab {...args}>
    <mds-tab-item>First Blood</mds-tab-item>
    <mds-tab-item>Second Impact</mds-tab-item>
    <mds-tab-item>The Third Reich</mds-tab-item>
  </mds-tab>

export const Default = Template.bind({})
// Default.args = {
//   progress: 0.35,
// }
