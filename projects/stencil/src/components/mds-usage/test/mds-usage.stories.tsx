import { usageDictionary } from '../meta/dictionary'
import { h } from '@stencil/core'

export default {
  title: 'UI / Usage',
  argTypes: {
    alias: {
      description: 'Specifies the alias of the usage phrase on the top of the component.',
      type: { name: 'string' },
    },
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

export const Default = Template.bind({})
export const Alias = Template.bind({})
Alias.args = {
  alias: 'Custom alias',
}
export const Variant = Template.bind({})
Variant.args = {
  variant: 'dont',
}

