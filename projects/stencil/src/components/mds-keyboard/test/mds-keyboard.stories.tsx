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

const TemplateSingleKey = args =>
  <mds-keyboard {...args}>
    <mds-keyboard-key>F1</mds-keyboard-key>
  </mds-keyboard>

const TemplateMultipleKeys = args =>
  <mds-keyboard {...args}>
    <mds-keyboard-key code="control">ctrl</mds-keyboard-key>
    <mds-keyboard-key>x</mds-keyboard-key>
  </mds-keyboard>

export const Default = TemplateSingleKey.bind({})
Default.args = {
  try: true,
}

export const MultipleKeys = TemplateMultipleKeys.bind({})
MultipleKeys.args = {
  try: true,
}
