import { strategyDictionary } from '../meta/dictionary'
import { h } from '@stencil/core'

export default {
  title: 'UI / Notification',
  argTypes: {
    strategy: {
      type: { name: 'string' },
      description: 'Specifies the position strategy of the notification',
      options: strategyDictionary,
      control: { type: 'select' },
    },
    value: {
      description: 'Specifies the number of notifications to display',
      type: { name: 'number' },
    },
    visible: {
      description: 'Specifies if the notification is displayed',
      type: { name: 'boolean' },
    },
  },
}

const Template = args =>
  <div>
    <mds-notification target="my-button" {...args}/>
    <mds-button class="fixed bottom-20 right-20" id="my-button" icon="mdi/email">Incoming messages</mds-button>
  </div>

const TemplateStatic = args =>
  <div>
    <mds-button class="fixed bottom-20 right-20" id="my-button" icon="mdi/email">
      Incoming messages
      <mds-notification slot="notification" {...args}/>
    </mds-button>
  </div>

export const Default = Template.bind({})

export const Value = Template.bind({})
Value.args = {
  value: 7,
  visible: true,
}

export const NoValue = Template.bind({})
NoValue.args = {
  visible: true,
}

export const Static = TemplateStatic.bind({})
Static.args = {
  strategy: 'static',
  value: 7,
  visible: true,
}
