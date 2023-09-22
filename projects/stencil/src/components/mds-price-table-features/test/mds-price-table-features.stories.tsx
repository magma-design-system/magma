import { h } from '@stencil/core'

export default {
  title: 'UI / Price table / Price table features',
}

const Template = args =>
  <mds-price-table>
    <mds-price-table-features {...args}>
      <mds-price-table-features-row label="Base features">
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Users">
        <mds-price-table-features-cell supported="text">10</mds-price-table-features-cell>
        <mds-price-table-features-cell supported="text">20</mds-price-table-features-cell>
        <mds-price-table-features-cell supported="text">Unlimited</mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="User data">
        <mds-price-table-features-cell supported="text">10GB</mds-price-table-features-cell>
        <mds-price-table-features-cell supported="text">20GB</mds-price-table-features-cell>
        <mds-price-table-features-cell supported="text">1TB</mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Customer support">
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Automated functionalities">
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Analytics">
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Export reports">
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Reports snapshots">
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Advanced reports">
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
    </mds-price-table-features>
  </mds-price-table>

export const Default = Template.bind({})
Default.args = {
  label: 'Report e analisi',
}
