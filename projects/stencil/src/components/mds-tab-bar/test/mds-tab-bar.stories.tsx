import { h } from '@stencil/core';

export default {
  title: 'UI / Tab Bar',
};

const Template = (args) => (
  <mds-tab-bar {...args}>
    <mds-tab-bar-item icon="mdi/barley" selected label="First Blood"></mds-tab-bar-item>
    <mds-tab-bar-item icon="mdi/crown" label="Second Impact"></mds-tab-bar-item>
    <mds-tab-bar-item icon="mi/baseline/timer" label="The Third Reich"></mds-tab-bar-item>
    <mds-tab-bar-item
      icon="mi/baseline/account-balance"
      label="The Fantastic Four"
    ></mds-tab-bar-item>
    <mds-tab-bar-item
      icon="mi/baseline/account-balance-wallet"
      label="The Fifth Element"
    ></mds-tab-bar-item>
  </mds-tab-bar>
);

export const Default = {
  render: Template,
};
