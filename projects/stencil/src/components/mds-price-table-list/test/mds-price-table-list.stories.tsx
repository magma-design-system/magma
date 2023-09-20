import { h } from '@stencil/core'

export default {
  title: 'UI / Price table / Price table list',
}

const Template = args =>
  <mds-price-table-list {...args}>
    <mds-text typography="h5" slot="header">Basic plan</mds-text>
    <mds-text typography="detail" slot="header">Piano adatto a liberi professionisti con studi di piccole dimensioni.</mds-text>
    <mds-price-table-list-item supported>Basic features</mds-price-table-list-item>
    <mds-price-table-list-item supported>10 Users</mds-price-table-list-item>
    <mds-price-table-list-item supported>20GB disk space per user</mds-price-table-list-item>
    <mds-price-table-list-item supported>Chat support</mds-price-table-list-item>
    <mds-price-table-list-item supported>Automated flows</mds-price-table-list-item>
    <mds-price-table-list-item>Analytics</mds-price-table-list-item>
    <mds-price-table-list-item>Report export</mds-price-table-list-item>
    <mds-price-table-list-item supported>Report snapshots</mds-price-table-list-item>
    <mds-price-table-list-item>Advanced reports</mds-price-table-list-item>
    <mds-price-table-list-item>API access</mds-price-table-list-item>
    <mds-text typography="h2" slot="price">49€</mds-text>
    <mds-button slot="action" variant="dark">Inizia</mds-button>
  </mds-price-table-list>

export const Default = Template.bind({})

