import React from 'react'
import MdsDetails from '@component/mds-details/mds-details'

export default {
  title: 'UI / Details',
  component: MdsDetails,
  argTypes: {
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is opened',
    },
  },
}

const Template = args =>
  <mds-details {...args}>
    <mds-icon slot="icon" name="mi/baseline/check-circle"/>
    <mds-text typography="h6" slot="title">Vision</mds-text>
    <mds-text typography="detail">
      Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare il futuro del tuo prodotto.
    </mds-text>
    <mds-button slot="action" size="sm">Vai al contenuto</mds-button>
  </mds-details>

export const Default = Template.bind({})


export const Opened = Template.bind({})
Opened.args = {
  opened: true,
}
