import { h } from '@stencil/core'

export default {
  title: 'UI / Price table / Price table features cell',
}

const Template = args =>
  <mds-price-table>
    <mds-price-table-features {...args}>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">
          Base features
          <mds-help auto-placement="false" placement="top">This option is available only on afternoon.</mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported">
          <mds-help auto-placement="false" placement="top">This option is available only on afternoon.</mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">
          Users
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported">
          <mds-help auto-placement="false" placement="top">Sometimes it's just not working.</mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">
          Data bandwidth
          <mds-help auto-placement="false" placement="top">Per user</mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell>10GB</mds-price-table-features-cell>
        <mds-price-table-features-cell>20GB</mds-price-table-features-cell>
        <mds-price-table-features-cell>
          1TB<mds-help auto-placement="false" placement="top">Just joking, the space is 30GB</mds-help>
        </mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row>
        <mds-price-table-features-cell type="label">
          Customer support
        </mds-price-table-features-cell>
        <mds-price-table-features-cell class="px-300" type="custom">
          <span>Uno</span>
          <mds-help auto-placement="false" placement="top">This is very nice.</mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell class="px-300" type="custom"><span>Due</span></mds-price-table-features-cell>
        <mds-price-table-features-cell class="px-300" type="custom"><span>Tre</span></mds-price-table-features-cell>
      </mds-price-table-features-row>
    </mds-price-table-features>
  </mds-price-table>

export const Default = Template.bind({})
Default.args = {
  label: 'Report e analisi',
}
