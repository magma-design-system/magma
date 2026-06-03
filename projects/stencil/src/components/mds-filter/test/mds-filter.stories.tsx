import { h } from '@stencil/core';

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
    reset: {
      type: { name: 'boolean' },
      description: 'Shows a reset button if one or more filters are active',
    },
  },
};

const Template = (args) => (
  <mds-filter {...args}>
    <mds-filter-item label="This first time" value="1" count="101" />
    <mds-filter-item label="Infamous second son" value="2" count="43" />
    <mds-filter-item label="The third sequence" value="3" count="7" />
  </mds-filter>
);

export const Default = {
  render: Template,

  args: {
    label: 'Filter label',
  },
};

export const AutoReset = {
  render: Template,

  args: {
    multiple: true,
    'auto-reset': true,
  },
};

export const Reset = {
  render: Template,

  args: {
    multiple: true,
    reset: true,
  },
};

export const Multiple = {
  render: Template,

  args: {
    multiple: true,
  },
};
