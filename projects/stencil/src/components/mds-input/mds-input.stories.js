import React from 'react'
import faker from 'faker'
import MdsInput from '../../../dist/collection/components/mds-input/mds-input'

// https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill

export default {
  title: 'Form / Input',
  component: MdsInput,
  argTypes: {
    autoComplete: {
      defaultValue: undefined,
      description: 'Specifies whether the element should have autocomplete enabled',
      options: ['on', 'off'],
      control: { type: 'select' }
    },
    autoFocus: {
      type: { name: 'boolean', required: false },
      description: 'Specifies that the element should automatically get focus when the page loads',
      defaultValue: false,
    },
    disabled: {
      type: { name: 'boolean', required: false },
      description: 'If true, the element is displayed as disabled',
      defaultValue: false,
    },
    max: {
      type: { name: 'string', required: false },
      description: 'Specifies the maximum value',
      defaultValue: undefined,
    },
    maxLength: {
      type: { name: 'number', required: false },
      description: 'Specifies the maximum number of characters allowed in an element',
      defaultValue: undefined,
    },
    min: {
      type: { name: 'string', required: false },
      description: 'Specifies the minimum value',
      defaultValue: undefined,
    },
    minLength: {
      type: { name: 'number', required: false },
      description: 'Specifies the minimum number of characters allowed in an element',
      defaultValue: undefined,
    },
    name: {
      type: { name: 'string', required: false },
      description: 'Is needed to reference the form data after the form is submitted',
      defaultValue: undefined,
    },
    pattern: {
      type: { name: 'string', required: false },
      description: 'Specifies a regular expression that element\'s value is checked against',
      defaultValue: undefined,
    },
    placeholder: {
      type: { name: 'string', required: false },
      description: 'Specifies a short hint that describes the expected value of the element',
      defaultValue: undefined,
    },
    readOnly: {
      type: { name: 'boolean', required: false },
      description: 'Specifies that the element is read-only',
      defaultValue: false,
    },
    required: {
      type: { name: 'boolean', required: false },
      description: 'Specifies that the element must be filled out before submitting the form',
      defaultValue: false,
    },
    type: {
      type: { name: 'string', required: true },
      description: 'Specifies the type of element',
      options: ['date', 'email', 'number', 'password', 'search', 'tel', 'text', 'time', 'url'],
      control: { type: 'select' },
      defaultValue: 'text',
    },
    value: {
      type: { name: 'string', required: false },
      description: 'Specifies the value of the element',
      defaultValue: undefined,
    },
  },
}

const Template = (args) =>
  <mds-input {...args}></mds-input>;

export const Default = Template.bind({});
Default.args = {
  value: 'This is an input field',
};

export const autoComplete = Template.bind({});
autoComplete.args = {
  autoComplete: 'cc-name',
  type: 'text',
  value: 'Search a country...',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  value: 'Input field with disabled attribute',
};

export const max = Template.bind({});
max.args = {
  max: '3',
  type: 'number',
  value: '2',
};
