import React from 'react'
import MdsButton from '@component/mds-button/mds-button'
import mggIconsDictionary from '@maggioli-design-system/icons/resources/mgg-icons.json'
const iconsDictionary = Object.keys(mggIconsDictionary).sort()

import {
  buttonVariantDictionary,
  buttonSizeDictionary,
  buttonToneVariantDictionary,
  buttonIconPositionDictionary,
} from '@dictionary/button'

export default {
  title: 'UI / Button',
  component: MdsButton,
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string' },
      description: 'Specifies the horizontal position of the icon displayed in the button',
      options: buttonIconPositionDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size of the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the button',
      options: buttonToneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-button {...args}>
    Conferma azione
  </mds-button>

const TemplateIcon = args =>
  <mds-button {...args}/>

export const Default = Template.bind({})
Default.args = {
  icon: 'home-group',
}

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
  icon: 'home-group',
}

export const iconPosition = Template.bind({})
iconPosition.args = {
  'icon-position': 'right',
  icon: 'home-group',
}
