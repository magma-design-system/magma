import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'

export default {
  title: 'UI / Entity',
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description: 'Shows the cross icon to perform cancel/delete action on element',
    },
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
  },
}

const Template = args =>
  <mds-entity {...args} aria-label="Personaggio">
    <mds-text aria-label="Nome" typography="h6">Mario Rossi</mds-text>
    <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="quiet">buono</mds-badge>
    <mds-text aria-label="Email" slot="detail" typography="caption">mario@nintendo.com</mds-text>
  </mds-entity>

const TemplateWario = args =>
  <mds-entity {...args} aria-label="Personaggio">
    <mds-text aria-label="Nome" typography="h6">Wario</mds-text>
    <mds-badge aria-label="Carattere" slot="detail" variant="violet" tone="quiet">cattivo</mds-badge>
    <mds-text aria-label="Email" slot="detail" typography="caption">wario@nintendo.com</mds-text>
  </mds-entity>

const TemplateLocation = args =>
  <mds-entity {...args} aria-label="Luogo">
    <mds-text aria-label="Nome" typography="h6">Maggioli Headquarters</mds-text>
    <mds-text aria-label="Strada" slot="detail" typography="caption">Via Pinelli 64, Santarcangelo di Romanga, Italy</mds-text>
  </mds-entity>

export const Default = Template.bind({})
Default.args = {
  src: './avatar-mario-01.png',
}

export const Deletable = TemplateWario.bind({})
Deletable.args = {
  deletable: true,
  src: './avatar-wario-03.jpg',
}

export const Icon = TemplateLocation.bind({})
Icon.args = {
  icon: 'mi/baseline/route',
}
