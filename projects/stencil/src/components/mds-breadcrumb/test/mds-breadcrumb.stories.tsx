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

const Template = args =>
  <mds-breadcrumb {...args}>
    <mds-breadcrumb-item>First item</mds-breadcrumb-item>
    <mds-breadcrumb-item>Second</mds-breadcrumb-item>
    <mds-breadcrumb-item>The third</mds-breadcrumb-item>
  </mds-breadcrumb>

export const Default = Template.bind({})

