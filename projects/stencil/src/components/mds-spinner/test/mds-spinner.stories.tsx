import { h } from '@stencil/core'
import { lokiDisabled } from '@test/loki-disabled'

export default {
  title: 'UI / Spinner',
}

const Template = args =>
  <mds-spinner {...args}/>

export const Default = Template.bind({})
Default.story = lokiDisabled
