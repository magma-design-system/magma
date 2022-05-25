import { h } from '@stencil/core'

export default {
  title: 'UI / Hr',
}

const Template = args =>
  <mds-hr {...args}/>

export const Default = Template.bind({})

export const Style = Template.bind({})
Style.args = {
  class: 'bg-adjust-tone-04',
}
