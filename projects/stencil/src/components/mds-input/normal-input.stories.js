import React from 'react'

export default {
  title: 'Form / Input normal',
}

const Template = () =>
  <input type="text" autocomplete="street-address" placeholder="street-address"></input>

export const Default = Template.bind({})
Default.args = {
  value: 'This is an input field',
}
