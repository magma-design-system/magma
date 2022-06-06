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
  <mds-entity {...args}>
    <mds-text typography="h6">Mario Rossi</mds-text>
    <mds-badge slot="detail" variant="orange" tone="quiet">good</mds-badge>
    <mds-text slot="detail" typography="caption">mario@nintendo.com</mds-text>
  </mds-entity>

const TemplateWario = args =>
  <mds-entity {...args}>
    <mds-text typography="h6">Wario</mds-text>
    <mds-badge slot="detail" variant="violet" tone="quiet">evil</mds-badge>
    <mds-text slot="detail" typography="caption">wario@nintendo.com</mds-text>
  </mds-entity>

const TemplateLocation = args =>
  <mds-entity {...args}>
    <mds-text typography="h6">Maggioli Headquarters</mds-text>
    <mds-text slot="detail" typography="caption">Via Pinelli 64, Santarcangelo di Romanga, Italy</mds-text>
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
