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
      <mds-table-header-cell label="Username"></mds-table-header-cell>
      <mds-table-header-cell label="Email"></mds-table-header-cell>
      <mds-table-header-cell label="Date"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">mario.rossi</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">mario.rossi@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">12 ottobre 1985</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">luigi.verdi</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">luigi.verdi@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">12 ottobre 1985</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">wario.gialli</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">wario.gialli@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">3 marzo 1993</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">waluigi.violetti</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">waluigi.violetti@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">8 giugno 1999</mds-text></mds-table-cell>
      </mds-table-row>
    </mds-table-body>
    <mds-table-footer>
      <mds-table-cell><mds-text typography="action">Username</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">Email</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">Date</mds-text></mds-table-cell>
    </mds-table-footer>
  </mds-table>

const TemplateSortable = args =>
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings from cell"></mds-table-header-cell>
      <mds-table-header-cell label="No sortable column"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">3</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">01</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">Tower Plaza</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 777 892301</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">1</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">05</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">22nd Evenue</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 433 471047</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">2</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">11</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">ARK Plaza</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 334 187366</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">4</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">22</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">_Underscore Building</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 333 997741</mds-text></mds-table-cell>
      </mds-table-row>
    </mds-table-body>
  </mds-table>

export const Default = Template.bind({})

export const Interactive = Template.bind({})
Interactive.args = {
  interactive: true,
}

export const Sortable = TemplateSortable.bind({})
Sortable.args = {
  interactive: true,
}

export const Pivot = TemplateSortable.bind({})
Pivot.args = {
  interactive: true,
  pivot: true,
}
