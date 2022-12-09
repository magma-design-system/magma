import { h } from '@stencil/core'

export default {
  title: 'UI / Filter',
  argTypes: {
    label: {
      type: { name: 'string' },
      description: 'Sets the label of the filter',
    },
  },
}

const Template = args =>
  <mds-filter {...args}>
    <mds-filter-item label="This first time"/>
    <mds-filter-item label="Infamous second son"/>
    <mds-filter-item label="The third sequence"/>
  </mds-filter>

export const Default = Template.bind({})
Default.args = {
  label: 'Filter label',
}

export const Multiple = Template.bind({})
Multiple.args = {
  multiple: true,
}
