import { h } from '@stencil/core'

export default {
  title: 'UI / Price table / Price table features',
}

const Template = args =>
  <mds-price-table>
    <mds-price-table-features {...args}>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Base features</mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">20</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">Unlimited</mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">10GB</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">20GB</mds-price-table-features-cell>
        <mds-price-table-features-cell type="text">
          1TB
          <mds-help auto-placement="false" placement="top">It can vary by server status.</mds-help>
        </mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Customer support</mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Automated functionalities</mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Export reports</mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Reports snapshots</mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">Advanced reports</mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
    </mds-price-table-features>
  </mds-price-table>

export const Default = Template.bind({})
Default.args = {
  label: 'Report e analisi',
}
