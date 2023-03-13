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

export const running = Template.bind({})
running.story = lokiDisabled
running.args = {
  running: true,
}
