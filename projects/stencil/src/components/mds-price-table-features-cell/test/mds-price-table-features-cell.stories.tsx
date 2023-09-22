import { h } from '@stencil/core'

export default {
  title: 'UI / Price table / Price table features cell',
}

const Template = args =>
  <mds-price-table>
    <mds-price-table-features {...args}>
      <mds-price-table-features-row label="Base features">
        <mds-price-table-features-cell supported="true" tip="This option is available only on afternoon."></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="true"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Users">
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="false" tip="Sometimes it's just not working."></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="false"></mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="User data">
        <mds-price-table-features-cell supported="text">10GB</mds-price-table-features-cell>
        <mds-price-table-features-cell supported="text">20GB</mds-price-table-features-cell>
        <mds-price-table-features-cell supported="text" tip="Just joking, the space is 30GB">1TB</mds-price-table-features-cell>
      </mds-price-table-features-row>
      <mds-price-table-features-row label="Customer support">
        <mds-price-table-features-cell supported="custom" tip="This is very nice."><span>Uno</span></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="custom"><span>Due</span></mds-price-table-features-cell>
        <mds-price-table-features-cell supported="custom"><span>Tre</span></mds-price-table-features-cell>
      </mds-price-table-features-row>
    </mds-price-table-features>
  </mds-price-table>

export const Default = Template.bind({})
Default.args = {
  label: 'Report e analisi',
}
