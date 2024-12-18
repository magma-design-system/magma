import { h } from '@stencil/core'

export default {
  title: 'UI / Calendar',
  argTypes: { },
}

const Template = args =>
  <mds-calendar {...args}></mds-calendar>

export const Default = Template.bind({})
Default.args = { }
