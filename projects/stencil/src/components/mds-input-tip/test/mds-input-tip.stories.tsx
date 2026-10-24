import { inputTipPositionDictionary } from '../meta/dictionary';
import { h } from '@stencil/core';

export default {
  title: 'UI / Forms / Input / Input Tip',
  id: 'form-input-tip',
  argTypes: {
    active: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is active and shows expanded children or not',
    },
    position: {
      description: 'Specifies the position of the element relative to its container',
      options: inputTipPositionDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-input-tip {...args}>
    <mds-input-tip-item variant="required"></mds-input-tip-item>
    <mds-input-tip-item variant="disabled"></mds-input-tip-item>
    <mds-input-tip-item variant="readonly"></mds-input-tip-item>
  </mds-input-tip>
);

export const Default = {
  render: Template,
};
