import React from 'react'
import MdsButton from '@component/mds-button/mds-button'
import { typographyPrimaryDictionary } from '@dictionary/typography'
import { buttonVariantDictionary, buttonSizeDictionary, buttonToneVariantDictionary } from '@dictionary/button'
import { iconPositionDictionary } from '@dictionary/icon-position'
import mggIconsDictionary from '@maggioli-design-system/icons/resources/mgg-icons.json'
const iconsDictionary = Object.keys(mggIconsDictionary).sort()
import faker from 'faker'

export default {
  title: 'Form / Button',
  component: MdsButton,
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
      options: iconPositionDictionary,
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
    typography: {
      type: { name: 'string', required: false },
      description: 'Specifies the typography of the element',
      options: typographyPrimaryDictionary,
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
  <mds-button {...args}>
    { faker.lorem.sentence(2) }
  </mds-button>

export const Default = Template.bind({})
Default.args = {
  icon: 'action-send',
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

export const iconPosition = Template.bind({})
iconPosition.args = {
  'icon-position': 'right',
  icon: 'action-send',
}
