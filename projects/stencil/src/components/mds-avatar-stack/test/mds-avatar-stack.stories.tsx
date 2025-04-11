import { h } from '@stencil/core'
import { sizesDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Avatar stack',
  argTypes: {
    size: {
      type: { name: 'string' },
      description: '',
      options: sizesDictionary,
      control: { type: 'select' },
    },
    total: {
      type: { name: 'number' },
      description: '',
    },
  },
}

const Template = args =>
  <mds-avatar-stack {...args}>
    <mds-avatar-stack-item initials='mr' tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials='ac' tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials='er' tone="weak"></mds-avatar-stack-item>
  </mds-avatar-stack>

export const Default = Template.bind({})
Default.args = {
  total: 15,
}
