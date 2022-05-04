import React from 'react'
import MdsTabBar from '@component/mds-tab-bar/mds-tab-bar'

export default {
  title: 'UI / Tab Bar',
  component: MdsTabBar,
}

const Template = args =>
  <mds-tab-bar {...args}>
    <mds-tab-bar-item icon="mdi/barley" selected>First Blood</mds-tab-bar-item>
    <mds-tab-bar-item icon="mdi/crown">Second Impact</mds-tab-bar-item>
    <mds-tab-bar-item icon="mi/baseline/timer">The Third Reich</mds-tab-bar-item>
    <mds-tab-bar-item icon="mi/baseline/account-balance">The Fantastic Four</mds-tab-bar-item>
    <mds-tab-bar-item icon="mi/baseline/account-balance-wallet">The Fifth Element</mds-tab-bar-item>
  </mds-tab-bar>

export const Default = Template.bind({})
