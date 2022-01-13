import React from 'react'
import MdsUsage from '@component/mds-usage/mds-usage'

import { usageDictionary } from '../meta/dictionary'
export default {
  title: 'UI / Usage',
  component: MdsUsage,
  argTypes: {
    variant: {
      control: { type: 'select' },
      description: 'Specifies whether a browser should load an iframe immediately or to defer loading of images until some conditions are met.',
      options: usageDictionary,
      type: { name: 'string' },
    },
  },
}

const Template = args =>
  <mds-usage {...args}>
    <mds-text>
      Non usare troppi stili nello stesso paragrafo. Si consiglia di utilizzare uno stile per il titolo, uno per il sottotitolo e uno per il testo più un eventuale bold per sottolineare un concetto.
    </mds-text>
    <mds-text>
      Non modificare gli stili di testo stabiliti. Tentare di usare solo gli stili presenti all’interno del design system.
    </mds-text>
  </mds-usage>

export let Default = Template.bind({})

