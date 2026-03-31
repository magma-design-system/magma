import { h } from '@stencil/core'
import { iconsDictionary } from '@type/icon'
import {
  buttonVariantDictionary,
  buttonToneVariantDictionary,
} from '@type/button'

export default {
  title: 'UI / Radial Menu / Radial Menu Item',
  argTypes: {
    tooltip: {
      type: { name: 'string' },
      description: 'The tooltip displayed when hovering over the button',
    },
    icon: {
      type: { name: 'string' },
      description: 'The icon displayed in the button',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant for the button',
      options: buttonToneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the color variant for the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args => (
  <div class="h-dvh min-h-[600px] flex items-center justify-center">
    <mds-radial-menu opened size="lg">
      <mds-radial-menu-item {...args}></mds-radial-menu-item>
    </mds-radial-menu>
  </div>
)

export const Default = {
  render: Template,

  args: {
    icon: 'mi/round/email',
  },
}
