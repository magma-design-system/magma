import { h } from '@stencil/core'


export default {
  title: 'UI / Breadcrumb / Breadcrumb Item',
  argTypes: {
    selected: {
      type: { name: 'boolean', required: false },
      description: 'Choose if the component is selected or not',
    },
  },
}

const Template = args =>
  <mds-breadcrumb>
    <mds-breadcrumb-item {...args}>First item</mds-breadcrumb-item>
    <mds-breadcrumb-item>Second</mds-breadcrumb-item>
    <mds-breadcrumb-item>The third</mds-breadcrumb-item>
  </mds-breadcrumb>

export const Default = Template.bind({})
export const Selected = Template.bind({})
Selected.args = {
  selected: true,
}
