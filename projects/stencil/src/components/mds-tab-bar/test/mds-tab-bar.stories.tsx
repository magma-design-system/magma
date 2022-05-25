import { h } from '@stencil/core'

export default {
  title: 'UI / Tab Bar',
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
