import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
import { themeFullVariantAvatarDictionary, toneMinimalVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Entity',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon to be displayed if src propery is not used',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    initials: {
      type: { name: 'string' },
      description: 'The user\'s inizials displayed if there\'s no image available and icon is not set',
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the avatar image',
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the component',
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the component',
      options: themeFullVariantAvatarDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-entity {...args} aria-label="Personaggio">
    <mds-text aria-label="Nome" typography="h6">Mario Rossi</mds-text>
    <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="quiet">buono</mds-badge>
    <mds-text aria-label="Email" slot="detail" typography="caption">mario@nintendo.com</mds-text>
    <mds-button onClick={() => { console.info('Restore') }} slot="action" icon="mdi/replay" variant="primary" tone="strong" title="Restore"/>
    <mds-button onClick={() => { console.info('Delete') }} slot="action" icon="mdi/delete" variant="error" tone="strong" title="Delete"/>
  </mds-entity>

const TemplateLocation = args =>
  <mds-entity {...args} aria-label="Luogo">
    <mds-text aria-label="Nome" typography="h6">Maggioli Headquarters</mds-text>
    <mds-text aria-label="Strada" slot="detail" typography="caption">Via Pinelli 64, Santarcangelo di Romanga, Italy</mds-text>
    <mds-button slot="action" icon="mdi/map-marker" variant="primary" tone="strong" title="Go to Google Maps"/>
  </mds-entity>

export const Default = Template.bind({})
Default.args = {
  src: './avatar-mario-01.png',
}

export const Icon = TemplateLocation.bind({})
Icon.args = {
  icon: 'mi/baseline/route',
}
