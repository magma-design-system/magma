import { h } from '@stencil/core'

export default {
  title: 'UI / Filter / Filter item',
  argTypes: {
    count: {
      type: { name: 'string' },
      description:
        'Shows the number of items will be filtered by the component',
    },
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

const Template = args => (
  <div class="inline-flex">
    <mds-filter-item {...args} />
  </div>
)

export const Default = {
  render: Template,

  args: {
    label: 'Filter label',
  },
}

export const Selected = {
  render: Template,

  args: {
    label: 'Filter label',
    selected: true,
  },
}
