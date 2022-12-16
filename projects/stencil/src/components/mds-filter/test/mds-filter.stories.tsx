import { h } from '@stencil/core'

export default {
  title: 'UI / Filter',
  argTypes: {
    'auto-reset': {
      type: { name: 'boolean' },
      description: 'Sets an automatic reset of active filters if all filters are triggered',
    },
    label: {
      type: { name: 'string' },
      description: 'Sets the label of the filter',
    },
    multiple: {
      type: { name: 'boolean' },
      description: 'Sets if the filter group can filter multiple filters simultaneously',
    },
  },
}

const Template = args =>
  <mds-filter {...args}>
    <mds-filter-item label="This first time" value="1"/>
    <mds-filter-item label="Infamous second son" value="2"/>
    <mds-filter-item label="The third sequence" value="3"/>
  </mds-filter>

export const Default = Template.bind({})
Default.args = {
  label: 'Filter label',
}

export const autoReset = Template.bind({})
autoReset.args = {
  multiple: true,
  'auto-reset': true,
}

export const Multiple = Template.bind({})
Multiple.args = {
  multiple: true,
}
