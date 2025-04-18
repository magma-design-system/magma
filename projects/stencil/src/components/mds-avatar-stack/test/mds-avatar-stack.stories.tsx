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
    <mds-avatar-stack-item initials='mt' tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials='jb' tone="weak"></mds-avatar-stack-item>
  </mds-avatar-stack>

export const Default = Template.bind({})

export const Size = Template.bind({})
Size.args = {
  size: 'lg',
  total: 8,
}

export const Total = Template.bind({})
Total.args = {
  total: 8,
}
