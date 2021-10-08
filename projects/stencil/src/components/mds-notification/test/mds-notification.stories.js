import React from 'react'
import MdsNotification from '@component/mds-notification/mds-notification'


export default {
  title: 'UI / Notification',
  component: MdsNotification,
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
    <mds-button icon="email"><span slot="text">Incoming messages</span></mds-button>
  </div>

export const Default = Template.bind({})

export const Value = Template.bind({})
Value.args = {
  value: 7
}
