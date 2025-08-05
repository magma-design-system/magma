import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
import {
  themeVariantChipDictionary,
  toneMinimalVariantDictionary,
} from '@dictionary/variant'
import { useEffect } from 'react'

export default {
  title: 'UI / Chip',
  argTypes: {
    clickable: {
      type: { name: 'boolean' },
      description: 'Adds ARIA support to the element if has interaction',
    },
    deletable: {
      type: { name: 'boolean' },
      description:
        'Shows the cross icon to perform cancel/delete action on element',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Sets the component disabled status',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon.',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: 'The label displayed to the right of the component\'s icon',
    },
    selected: {
      type: { name: 'boolean' },
      description: 'Sets the component selected',
    },
    selectable: {
      type: { name: 'boolean' },
      description:
        'Sets if the component change is status to selected when is clicked',
    },
    tone: {
      type: { name: 'string' },
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the color variant tone of the component',
    },
    variant: {
      type: { name: 'string' },
      options: themeVariantChipDictionary,
      control: { type: 'select' },
      description: 'Sets the color variant of the component',
    },
  },
}

const Template = args => {
  useEffect(() => {
    const chipEl = document.querySelector('mds-chip') as HTMLMdsChipElement
    chipEl.addEventListener('mdsChipClickLabel', (e: CustomEvent) => {
      console.info('mdsChipClickLabel', e.detail)
    })

    chipEl.addEventListener('mdsChipDelete', (e: CustomEvent) => {
      console.info('mdsChipDelete', e.detail)
    })

    chipEl.addEventListener('mdsChipSelect', (e: CustomEvent) => {
      console.info('mdsChipSelect', e.detail)
    })
  })
  return (
    <mds-chip
      {...args}
      onDelete={() => {
        console.info('onDelete')
      }}
    />
  )
}

export const Default = {
  render: Template,

  args: {
    label: 'Bovaro del Bernese',
    icon: 'mi/baseline/pets',
  },
}

export const Selected = {
  render: Template,

  args: {
    label: 'Bovaro del Bernese',
    icon: 'mi/baseline/pets',
    selected: true,
  },
}

export const Icon = {
  render: Template,

  args: {
    label: 'Bovaro del Bernese',
    icon: 'mi/baseline/eco',
  },
}

export const Deletable = {
  render: Template,

  args: {
    deletable: true,
    label: 'Bovaro del Bernese',
  },
}

export const Clickable = {
  render: Template,

  args: {
    clickable: true,
    selectable: true,
    icon: 'mi/baseline/eco',
    label: 'Hover me to interact',
  },
}

export const FullyInteractive = {
  render: Template,

  args: {
    clickable: true,
    deletable: true,
    icon: 'mi/baseline/downhill-skiing',
    label: 'Downhill skiing',
  },
}
