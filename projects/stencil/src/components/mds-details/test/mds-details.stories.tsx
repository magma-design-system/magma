import { h } from '@stencil/core'

export default {
  title: 'UI / Details',
  argTypes: {
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is opened',
    },
  },
}

const Template = args => (
  <mds-details {...args}>
    <mds-icon slot="icon" name="mi/baseline/check-circle" />
    <mds-text typography="h6" slot="title">
      Vision
    </mds-text>
    <mds-text typography="detail">
      Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare
      il futuro del tuo prodotto.
    </mds-text>
    <mds-button slot="action" size="sm">
      Vai al contenuto
    </mds-button>
  </mds-details>
)

export const Default = {
  render: Template,
}

export const Opened = {
  render: Template,

  args: {
    opened: true,
  },
}
