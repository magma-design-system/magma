import { h } from '@stencil/core'


export default {
  title: 'UI / Notification',
  argTypes: {
    value: {
      description: 'Specifies number of notifications to display',
      type: { name: 'number', required: false },
    },
  },
}

const Template = args =>
  <div class="relative inline-flex">
    <mds-notification class="absolute right-0 top-0" {...args}/>
    <mds-button icon="mdi/email">Incoming messages</mds-button>
  </div>

export const Default = Template.bind({})

export const Value = Template.bind({})
Value.args = {
  value: 7,
}
