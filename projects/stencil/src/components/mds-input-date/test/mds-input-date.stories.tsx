import { h } from '@stencil/core'

export default {
  title: 'Form / Input Date',
  argTypes: {
    disabled: {
      type: { name: 'boolean' },
      description: 'If true, the element is displayed as disabled',
    },
    min: {
      type: { name: 'string' },
      description: 'Specifies the min date can be set',
    },
    max: {
      type: { name: 'string' },
      description: 'Specifies the max date can be set',
    },
    readOnly: {
      type: { name: 'boolean' },
      description: 'Specifies that the element is read-only',
    },
    required: {
      type: { name: 'boolean' },
      description:
        'Specifies that the element must be filled out before submitting the form',
    },
    value: {
      type: { name: 'string' },
      description: 'Specifies the value of the input',
    },
  },
}

const getDate = (offsetDays: number = 0): string => {
  const today = new Date()
  today.setDate(today.getDate() + offsetDays)

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const Template = args => (
  <mds-input-date {...args} class="max-w-[400px]"></mds-input-date>
)

export const Default = {
  render: Template,

  args: {
    value: getDate(),
  },
}

export const MinMax = {
  render: Template,

  args: {
    min: getDate(-15),
    max: getDate(15),
  },
}

export const Invalid = {
  render: Template,

  args: {
    value: '2025-04-31',
  },
}

export const Required = {
  render: Template,

  args: {
    required: true,
  },
}

export const Disabled = {
  render: Template,

  args: {
    disabled: true,
  },
}
