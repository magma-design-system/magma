import { h } from '@stencil/core'

export default {
  title: 'UI / Filter / Filter item',
  argTypes: {
    selected: {
      type: { name: 'boolean' },
      description: 'Sets the component to selected state',
    },
    label: {
      type: { name: 'string' },
      description: 'Sets the label of the filter',
    },
    value: {
      type: { name: 'string' },
      description: 'Sets the value of the component to be used with forms',
    },
  },
}

const Template = args =>
  <div className="inline-flex">
    <mds-filter-item {...args}/>
  </div>

export const Default = Template.bind({})
Default.args = {
  label: 'Filter label',
}

export const selected = Template.bind({})
selected.args = {
  label: 'Filter label',
  selected: true,
}
