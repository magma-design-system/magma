import React from 'react'
import clsx from 'clsx'
import MdsBanner from '@component/mds-banner/mds-banner'
import { iconsDictionary } from '@dictionary/icon'
import { themeVariantDictionary, toneSimpleVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Banner',
  component: MdsBanner,
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description: 'Shows the cross icon to perform cancel/delete action on element',
    },
    headline: {
      type: { name: 'string' },
      description: 'The title on the top of the banner',
    },
    icon: {
      type: { name: 'string', required: true },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Sets the tone of the color variant',
      options: toneSimpleVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-banner {...args}>
    <mds-text typography="detail">
      Questa è una finestra banner, serve a informare gli utenti su uno stato iniziale o sul fatto che è cambiato.
    </mds-text>
  </mds-banner>

const TemplateActions = args =>
  <mds-banner {...args}>
    <mds-text typography="detail">
      Pare che la licenza di questo servizio sia scaduta, il servizio non smetterà di funzionare ma non potrai più utilizzare le <a href="#">funzioni premium</a>.
    </mds-text>
    <mds-button slot="actions" variant={args.variant} tone="ghost">Annulla</mds-button>
    <mds-button slot="actions" variant={args.variant}>Rinnova abbonamento</mds-button>
  </mds-banner>

const TemplateVariantDefault = args =>
  <mds-banner {...args}>
    <mds-text typography="detail">
      Il tuo account è stato aggiornato alla versione PRO, ora puoi utilizzare le notifiche su aggiornamenti di norme di legge e la consultazione dei volumi correlati.
    </mds-text>
    <mds-button slot="actions" variant="primary" tone="ghost">Cancel</mds-button>
    <mds-button slot="actions" variant="primary" tone={args.tone}>Confirm</mds-button>
  </mds-banner>

const TemplateVariantDark = args =>
  <mds-banner {...args}>
    <mds-text typography="detail">
      Il tuo account è stato aggiornato alla versione PRO, ora puoi utilizzare le notifiche su aggiornamenti di norme di legge e la consultazione dei volumi correlati.
    </mds-text>
    <mds-button slot="actions" variant="light" tone="quiet">Cancel</mds-button>
    <mds-button slot="actions" variant="dark" tone={args.tone}>Confirm</mds-button>
  </mds-banner>

const TemplateVariantLight = args =>
  <mds-banner {...args}>
    <mds-text typography="detail">
      Il tuo account è stato aggiornato alla versione PRO, ora puoi utilizzare le notifiche su aggiornamenti di norme di legge e la consultazione dei volumi correlati.
    </mds-text>
    <mds-button slot="actions" variant="dark" tone="quiet">Cancel</mds-button>
    <mds-button slot="actions" variant="dark" tone={args.tone}>Confirm</mds-button>
  </mds-banner>

const TemplateVariantStatus = args =>
  <mds-banner {...args}>
    <mds-text typography="detail">
    Se procederai, perderai i dati relativi modelli del database che hai registrato in precedenza. Conferma solo se sei consapevole di ciò che stai facendo.
    </mds-text>
    <mds-button slot="actions" variant={ args.variant } tone="quiet">Annulla</mds-button>
    <mds-button slot="actions" variant={ args.variant } tone="weak">Conferma</mds-button>
  </mds-banner>

export const Default = Template.bind({})

export const Headline = Template.bind({})
Headline.args = {
  headline: 'Avviso',
}

export const Icon = Template.bind({})
Icon.args = {
  icon: 'warning',
}

export const Deletable = Template.bind({})
Deletable.args = {
  deletable: true,
}

export const Actions = TemplateActions.bind({})

export const Variant = TemplateVariantDefault.bind({})
Variant.args = {
  headline: 'Impostazioni account',
  icon: 'info',
  deletable: true,
}

export const VariantDark = TemplateVariantDark.bind({})
VariantDark.args = {
  headline: 'Impostazioni account',
  icon: 'info',
  deletable: true,
  variant: 'dark',
}

export const VariantLight = TemplateVariantLight.bind({})
VariantLight.args = {
  headline: 'Impostazioni account',
  icon: 'info',
  deletable: true,
  variant: 'light',
}

export const VariantStatusWarning = TemplateVariantStatus.bind({})
VariantStatusWarning.args = {
  deletable: true,
  headline: 'Attenzione',
  icon: 'warning',
  variant: 'warning',
}
