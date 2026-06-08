import { h } from '@stencil/core';

export default {
  title: 'UI / Spinner',
  argTypes: {
    running: {
      type: { name: 'boolean' },
      description: 'Specifies the number of total pages to be handled',
    },
  },
};

const Template = (args) => <mds-spinner {...args} />;

export const Default = {
  render: Template,
};

export const Running = {
  render: Template,

  args: {
    running: true,
  },
};
