import { h } from '@stencil/core'

export default {
  title: 'UI / Keyboard',
  argTypes: {
    value: {
      type: { name: 'string' },
      description: 'Specifies the value of the input element',
    },
  },
}

const Template = args =>
  <mds-keyboard {...args}>
    <mds-keyboard-key>ctrl</mds-keyboard-key>
    <mds-keyboard-key>x</mds-keyboard-key>
  </mds-keyboard>

export const Default = Template.bind({})
// Default.args = { }
