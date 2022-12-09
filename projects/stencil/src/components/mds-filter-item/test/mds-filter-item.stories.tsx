import { h } from '@stencil/core'

export default {
  title: 'UI / Filter / Filter item',
  argTypes: {
    label: {
      type: { name: 'string' },
      description: 'Sets the label of the filter',
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
