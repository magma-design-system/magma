import { h } from '@stencil/core'
import { lokiDisabled } from '@test/loki-disabled'

export default {
  title: 'UI / Spinner',
  argTypes: {
    running: {
      type: { name: 'boolean' },
      description: 'Specifies the number of total pages to be handled',
    },
  },
}

const Template = args =>
  <mds-spinner {...args}/>

export const Default = Template.bind({})
Default.story = lokiDisabled

export const Running = Template.bind({})
Running.story = lokiDisabled
Running.args = {
  running: true,
}
