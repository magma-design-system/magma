import { inputTipItemVariantDictionary } from '../meta/dictionary';
import { h } from '@stencil/core';

export default {
  title: 'UI / Forms / Input / Input Tip / Item',
  id: 'form-input-tip-item',
  argTypes: {
    expanded: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is active and shows expanded children or not',
    },
    variant: {
      description: 'Specifies the position of the element relative to its container',
      options: inputTipItemVariantDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => <mds-input-tip-item {...args}></mds-input-tip-item>;

export const Default = {
  render: Template,
};
