import { h } from '@stencil/core'

export default {
  title: 'Form / Input Date Range',
  argTypes: {},
}

const Template = args =>
  <mds-input-date-range {...args}>
    <mds-input-date slot="start"></mds-input-date>
    <mds-input-date slot="end"></mds-input-date>
  </mds-input-date-range>

export const Default = Template.bind({})
Default.args = {
  'start-date': '2025-03-19',
  'end-date': '2025-03-21',
}
