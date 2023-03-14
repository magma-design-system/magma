import { h } from '@stencil/core'

export default {
  title: 'Deprecated / Layout / Table (Flex)',
  argTypes: {
    interactive: {
      description: 'Specifies if the table row are higlighted on mouseover event',
      type: { name: 'boolean' },
    },
    template: {
      description: 'Specifies the template for flex children elements',
      type: { name: 'string' },
    },
  },
}

const Template = args =>
  <mds-flex-table {...args}>
    <mds-flex-table-header>
      <mds-flex-table-cell><mds-text typography="action">Username</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Email</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Creation date</mds-text></mds-flex-table-cell>
    </mds-flex-table-header>
    <mds-flex-table-body>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-text>mario</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>mario.bros@nintendo.com</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>13 settembre 1985</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-text>wario</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>war.io@nintendo.com</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>21 ottobre 1992</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-text>luigi</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>lou81@nintendo.com</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>13 settembre 1985</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
    </mds-flex-table-body>
    {/* Template in mds-flex-table-footer è uno @State e non una @Prop? Sentire con Vitto */}
    <mds-flex-table-footer>
      <mds-flex-table-cell><mds-text typography="caption" class="text-tone-neutral-04">Lista utenti storici Nintendo</mds-text></mds-flex-table-cell>
    </mds-flex-table-footer>
  </mds-flex-table>

const TemplateManyItems = args =>
  <mds-flex-table {...args}>
    <mds-flex-table-header>
      <mds-flex-table-cell><mds-text typography="action">Avatar</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Username</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Email</mds-text></mds-flex-table-cell>
      <mds-flex-table-cell><mds-text typography="action">Full name</mds-text></mds-flex-table-cell>
    </mds-flex-table-header>
    <mds-flex-table-body class={(args._scroll && 'max-h-40')}>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials="mr" src="./avatar-mario-02.jpeg"/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>mario</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">mario.bros@nintendo.com</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>Mario Rossi</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials="lv" src="./avatar-luigi-02.jpeg"/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>luigi</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">lou85@nintendo.com</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>Luigi Verdi</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials="wr" src="./avatar-wario-02.jpg"/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>wario</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">war.io@nintendo.com</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>Wario Broccoli</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
      <mds-flex-table-row>
        <mds-flex-table-cell><mds-avatar class="w-12" initials="tf" src="./avatar-toad-01.jpg"/></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>toad</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text typography="hack">toad@nintendo.com</mds-text></mds-flex-table-cell>
        <mds-flex-table-cell><mds-text>Toad Fungi</mds-text></mds-flex-table-cell>
      </mds-flex-table-row>
    </mds-flex-table-body>
    <mds-flex-table-footer>
      <mds-flex-table-cell>
        <mds-text typography="caption">
          { args._scroll
            ? 'Scroll down inside the table area to see how scroll contents works.'
            : 'The grid table works with tabular data, no long text shoud be used.'
          }
        </mds-text>
      </mds-flex-table-cell>
    </mds-flex-table-footer>
  </mds-flex-table>

export const Default = Template.bind({})
Default.args = {
  template: '1 1 1',
}

export const tabularContents = TemplateManyItems.bind({})
tabularContents.args = {
  template: '0 1 4 2',
}

export const scrollContents = TemplateManyItems.bind({})
scrollContents.args = {
  _scroll: true,
  template: '0 1 4 2',
}
