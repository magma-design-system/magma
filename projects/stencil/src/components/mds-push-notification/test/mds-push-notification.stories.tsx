import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'

export default {
  title: 'UI / Push Notification',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon to be displayed if src propery is not used',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    message: {
      type: { name: 'string' },
      description: 'Specifies the message of the component',
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the image to be loaded',
    },
    subject: {
      type: { name: 'string' },
      description: 'Specifies the subject of the component',
    },
  },
}

const Template = args =>
  <div>
    <mds-push-notification {...args}></mds-push-notification>
  </div>


export const Default = Template.bind({})
Default.args = {
  icon: 'mi/baseline/email',
  message: 'You have 3 new messages',
  src: 'https://picsum.photos/200/300',
  subject: 'New messages',
}
