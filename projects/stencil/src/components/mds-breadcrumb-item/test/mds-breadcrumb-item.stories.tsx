import { h } from '@stencil/core';

export default {
  title: 'UI / Navigation / Breadcrumb / Breadcrumb Item',
  id: 'ui-breadcrumb-breadcrumb-item',
  argTypes: {
    selected: {
      type: { name: 'boolean', required: false },
      description: 'Choose if the component is selected or not',
    },
  },
};

const Template = (args) => (
  <mds-breadcrumb>
    <mds-breadcrumb-item {...args}></mds-breadcrumb-item>
    <mds-breadcrumb-item label="Second"></mds-breadcrumb-item>
    <mds-breadcrumb-item label="The third"></mds-breadcrumb-item>
  </mds-breadcrumb>
);

export const Default = {
  render: Template,

  args: {
    label: 'First item',
  },
};

export const Selected = {
  render: Template,

  args: {
    selected: true,
    label: 'First item',
  },
};
