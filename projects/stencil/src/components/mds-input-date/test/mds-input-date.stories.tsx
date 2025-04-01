import { h } from '@stencil/core'

export default {
  title: 'Form / Input Date',
  argTypes: {},
}

const Template = args =>
  <mds-input-date {...args}></mds-input-date>

export const Default = Template.bind({})
Default.args = {
  value: '2025-03-19',
  min: '2025-03-15',
  max: '2025-03-27',
}
