import { iconsDictionary } from '@dictionary/icon'

import {
  buttonVariantDictionary,
  buttonSizeDictionary,
  buttonToneVariantDictionary,
  buttonIconPositionDictionary,
} from '@dictionary/button'
import { h } from '@stencil/core'

export default {
  title: 'Form / Input Button',
  argTypes: {
    icon: {
      type: { name: 'string', required: false },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string', required: false },
      description: 'Specifies the horizontal position of the icon displayed in the button',
      options: buttonIconPositionDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string', required: false },
      description: 'Specifies the size of the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string', required: false },
      description: 'Specifies the tone variant of the button',
      options: buttonToneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string', required: false },
      description: 'Specifies the variant of the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-input-button {...args}>
    Button action
  </mds-input-button>

const TemplateIcon = args =>
  <mds-input-button {...args}/>

export const Default = Template.bind({})

export const Variant = Template.bind({})
Variant.args = {
  variant: 'success',
}

export const Tone = Template.bind({})
Tone.args = {
  variant: 'success',
  tone: 'weak',
}

export const Size = Template.bind({})
Size.args = {
  size: 'sm',
}

export const icon = TemplateIcon.bind({})
icon.args = {
  icon: 'mi/baseline/eco',
}

export const iconPosition = Template.bind({})
iconPosition.args = {
  'icon-position': 'right',
  icon: 'mi/baseline/eco',
}
