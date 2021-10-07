import React from 'react'
import MdsToast from '@component/mds-toast/mds-toast'
import { themeVariantDictionary, toneVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Toast',
  component: MdsToast,
  argTypes: {
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

const Template = args =>
  <mds-toast {...args}>
    <span slot="text">Elemento cancellato con successo</span>
    <mds-button slot="action" size="sm" variant={args.variant} tone={args.tone}><span slot="text">Annulla</span></mds-button>
  </mds-toast>

export const Default = Template.bind({})
