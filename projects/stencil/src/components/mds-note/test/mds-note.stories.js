import React from 'react'
import MdsNote from '@component/mds-note/mds-note'
import { themeLabelVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Note',
  component: MdsNote,
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description: 'The name of the icon. The icon set is strictly realted to @maggioli-design-system/icons',
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the color variant for the element',
      options: themeLabelVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-note {...args}>
    <mds-text typography="detail">What one programmer can do in one month, two programmers can do in two months.</mds-text>
  </mds-note>

const TemplateTitle = args =>
  <mds-note {...args}>
    <mds-text typography="h5" slot="title">Nota riunione Synbee</mds-text>
    <mds-text typography="detail">Posso prendere i dati solo dopo previa conferma dell'utente registrato.</mds-text>
    <mds-text typography="detail">È necessario dare il consenso anche a partner di terze parti per poter rendere al massimo l'analisi dei dati dell'utente.</mds-text>
  </mds-note>

export const Default = Template.bind({})
export const Deletable = Template.bind({})
Deletable.args = {
  deletable: true,
}
export const Title = TemplateTitle.bind({})
