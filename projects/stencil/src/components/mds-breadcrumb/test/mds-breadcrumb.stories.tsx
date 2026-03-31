import { h } from '@stencil/core'

export default {
  title: 'UI / Breadcrumb',
  argTypes: {
    back: {
      type: { name: 'boolean', required: false },
      description: 'Choose to display or not the back arrow button',
    },
  },
}

const Template = args => (
  <mds-breadcrumb {...args}>
    <mds-breadcrumb-item label="First item"></mds-breadcrumb-item>
    <mds-breadcrumb-item label="Second"></mds-breadcrumb-item>
    <mds-breadcrumb-item label="The third"></mds-breadcrumb-item>
  </mds-breadcrumb>
)

export const Default = {
  render: Template,
}
