import { h } from '@stencil/core'

export default {
  title: 'UI / Calendar',
  argTypes: {
    'start-date': {
      control: 'select',
      options: ['2024-12-12', '2024-12-14'],
      description: 'Sets the start date of the calendar',
    },
    'end-date': {
      control: 'select',
      options: ['2024-12-16', '2024-12-24'],
      description: 'Sets the end date of the calendar',
    },
  },
}

const Template = args =>
  <mds-calendar {...args}></mds-calendar>

export const Default = Template.bind({})
Default.args = {
  'start-date': '2024-12-12',
  'end-date': '2024-12-24',
}
