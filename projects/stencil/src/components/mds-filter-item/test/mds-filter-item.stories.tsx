import { h } from '@stencil/core'

export default {
  title: 'UI / Filter / Filter item',
  argTypes: {
    active: {
      type: { name: 'boolean' },
      description: 'Sets the component to active state',
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

export const Active = Template.bind({})
Active.args = {
  label: 'Filter label',
  active: true,
}
