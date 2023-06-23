import { themeVariantDictionary, toneMinimalVariantDictionary } from '@dictionary/variant'
import { h } from '@stencil/core'
import { toastPositionDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Toast',
  argTypes: {
    duration: {
      description: 'If set, specifies the visibility duration in milliseconds of the element inside the viewport, when the time is up the visible property will be set to false',
      type: { name: 'number', required: false },
    },
    position: {
      type: { name: 'string', required: false },
      description: 'Sets position of the toast',
      options: toastPositionDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string', required: false },
      description: 'Sets the tone of the color variant',
      options: toneMinimalVariantDictionary,
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

const checkVariant = (variant: any) => {
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
    <mds-icon slot="icon" name="mi/baseline/warning" />
    Elemento spidiguddato a sinistra con successo
    <mds-button slot="action" size="sm" variant={checkVariant(args.variant)} tone={args.tone}>Annulla</mds-button>
  </mds-toast>

export const Default = Template.bind({})
