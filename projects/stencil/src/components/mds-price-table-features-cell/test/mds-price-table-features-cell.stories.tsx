import { h } from '@stencil/core'

export default {
  title: 'UI / Price table / Price table features cell',
}

const Template = args =>
  <mds-price-table>
    <mds-price-table-features {...args}>
      <mds-price-table-features-row label="Base features">
        <mds-price-table-features-cell supported="true">
          <mds-help>This option is available only on afternoon.</mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Users">
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="false">
          <mds-help>Sometimes it's just not working.</mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="User data">
        <mds-price-table-features-cell supported="text">10GB</mds-price-table-features-cell>
        <mds-price-table-features-cell supported="text">20GB</mds-price-table-features-cell>
        <mds-price-table-features-cell supported="text">
          1TB<mds-help>Just joking, the space is 30GB</mds-help>
        </mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Customer support">
        <mds-price-table-features-cell class="px-3" supported="custom">
          <span>Uno</span>
          <mds-help>This is very nice.</mds-help>
        </mds-price-table-features-cell>
        <mds-price-table-features-cell class="px-3" supported="custom"><span>Due</span></mds-price-table-features-cell>
        <mds-price-table-features-cell class="px-3" supported="custom"><span>Tre</span></mds-price-table-features-cell>
      </mds-price-table-features-row>
    </mds-price-table-features>
  </mds-price-table>

export const Default = Template.bind({})
Default.args = {
  label: 'Report e analisi',
}
