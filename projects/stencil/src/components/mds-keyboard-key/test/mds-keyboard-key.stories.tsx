import { h } from '@stencil/core'
import { keyboardKeyNameDictionary } from '@dictionary/keyboard'

export default {
  title: 'UI / Keyboard / Key',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'Sets the name of the keyboard key for combination tests if `try` attribute is set from `mds-keyboard` parent component',
      options: keyboardKeyNameDictionary,
      control: { type: 'select' },
    },
  },
}

const TemplateSingleKey = args =>
  <mds-keyboard>
    <mds-keyboard-key {...args}></mds-keyboard-key>
  </mds-keyboard>

export const Default = TemplateSingleKey.bind({})
Default.args = {
  name: 'control',
}

