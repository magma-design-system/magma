import { h } from '@stencil/core'

export default {
  title: 'Layout / Table',
  argTypes: {
    interactive: {
      type: { name: 'boolean' },
      description: 'Specifies if the table row are higlighted on mouseover event',
    },
  },
}

const Template = args =>
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-cell><mds-text typography="action">Username</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">Email</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">Date</mds-text></mds-table-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">mario.rossi</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">mario.rossi@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">12 ottobre 1985</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">luigi.verdi</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">luigi.verdi@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">12 ottobre 1985</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">wario.gialli</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">wario.gialli@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">3 marzo 1993</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">waluigi.violetti</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">waluigi.violetti@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">8 giugno 1999</mds-text></mds-table-cell>
      </mds-table-row>
    </mds-table-body>
    <mds-table-footer>
      <mds-table-cell><mds-text typography="action">Username</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">Email</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">Date</mds-text></mds-table-cell>
    </mds-table-footer>
  </mds-table>

export const Default = Template.bind({})
