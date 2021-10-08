import React from 'react'
import MdsToast from '@component/mds-toast/mds-toast'
import { themeVariantDictionary, toneVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Toast',
  component: MdsToast,
  argTypes: {
    duration: {
      description: 'If set, specifies the visibility duration in milliseconds of the element inside the viewport, when the time is up the visible property will be set to false',
      type: { name: 'number', required: false },
    },
    tone: {
      type: { name: 'string', required: false },
      description: 'Sets the tone of the color variant',
      options: toneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string', required: false },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
    visible: {
      description: 'Specifies if the toast is visible or not',
      type: { name: 'boolean', required: false },
    },
  },
}

const checkVariant = (variant) => {
  if (variant === 'dark') {
    return 'light'
  }

  if (variant === 'light') {
    return 'dark'
  }

  return variant
}

const Template = args =>
  <mds-toast {...args}>
    <mds-icon slot="icon" name="warning"/>
    Elemento spidiguddato a sinistra con successo
    <mds-button slot="action" size="sm" inherit-theme variant={checkVariant(args.variant)} tone="ghost">Annulla</mds-button>
    <mds-button slot="action" size="sm" variant={checkVariant(args.variant)} tone={args.tone}>Annulla</mds-button>
  </mds-toast>

export const Default = Template.bind({})
