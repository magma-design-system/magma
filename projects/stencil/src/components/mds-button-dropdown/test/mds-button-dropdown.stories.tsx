import { h } from '@stencil/core'
import { iconsDictionary } from '@type/icon'
import {
  buttonDropdownVariantDictionary,
  buttonSizeDictionary,
  buttonToneMinimalVariantDictionary,
  buttonTargetDictionary,
  buttonTypeDictionary,
} from '@type/button'

export default {
  title: 'UI / Button dropdown',
  argTypes: {
    label: {
      type: { name: 'string' },
      description: 'Choose to display or not the back arrow button',
    },
    'auto-focus': {
      type: { name: 'boolean' },
      description:
        'Specifies if the component is focused when is loaded on the viewport',
    },
    await: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is awaiting to load a response',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is disabled or not',
    },
    href: {
      type: { name: 'string' },
      description: 'Specifies the URL target of the button',
    },
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size of the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    target: {
      type: { name: 'string' },
      options: buttonTargetDictionary,
      description: 'Specifies the target of the URL, if self or blank',
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the button',
      options: buttonToneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the button',
      options: buttonDropdownVariantDictionary,
      control: { type: 'select' },
    },
    type: {
      type: { name: 'string' },
      description: 'Specifies the type of the button',
      options: buttonTypeDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args => (
  <mds-button-dropdown {...args}>
    <mds-button
      icon="mi/baseline/send"
      variant="dark"
      tone="text"
      label="Invia subito"></mds-button>
    <mds-button
      icon="mi/baseline/delete"
      variant="dark"
      tone="text"
      label="Elimina"></mds-button>
  </mds-button-dropdown>
)

export const Default = {
  render: Template,

  args: {
    label: 'Salva come bozza',
    variant: 'success',
    tone: 'weak',
  },
}
