import { h } from '@stencil/core'

export default {
  title: 'UI / Date Picker',
  argTypes: {
    'start-date': {
      control: 'text', // Permette la scrittura manuale
      description: 'Sets the start date of the date picker',
    },
    'end-date': {
      control: 'text',
      description: 'Sets the end date of the date picker',
    },
  },
}

const Template = args => <mds-date-picker {...args}></mds-date-picker>

export const Default = Template.bind({})
Default.args = {
  'start-date': '2025-02-12',
  'end-date': '2025-02-24',
}
