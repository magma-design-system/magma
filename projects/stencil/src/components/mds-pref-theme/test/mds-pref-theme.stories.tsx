import { h } from '@stencil/core'

export default {
  title: 'UI / Preferences / Theme',
  argTypes: {
    setting: {
      type: { name: 'string' },
      description: 'Specifies the number of total pages to be handled',
    },
  },
}
const Template = args =>
  <mds-pref-theme {...args}/>

export const Default = Template.bind({})
Default.args = {

}
