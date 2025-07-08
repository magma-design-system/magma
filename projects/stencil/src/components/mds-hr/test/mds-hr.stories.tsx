import { h } from '@stencil/core'

export default {
  title: 'UI / Hr',
}

const Template = args => <mds-hr {...args} />

export const Default = {
  render: Template,
}

export const Style = {
  render: Template,

  args: {
    class: 'bg-tone-neutral-04',
  },
}
