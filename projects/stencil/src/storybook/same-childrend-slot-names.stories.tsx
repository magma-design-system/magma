import { h } from '@stencil/core'

export default {
  title: 'Common tests',
}

const Template = () => {
  return (
    <div class="grid gap-600">
      <mds-table>
        <mds-table-header>
          <mds-mds-table-header-cell label="Component"></mds-mds-table-header-cell>
        </mds-table-header>
        <mds-table-body>
          <mds-table-row>
            <mds-table-cell>
              <mds-entity>
                <mds-text typography="h6">This is a basic cell</mds-text>
                <mds-text typography="caption" slot="detail">
                  These are some details
                </mds-text>
                <mds-button
                  slot="action"
                  icon="mi/baseline/expand-more"
                ></mds-button>
              </mds-entity>
            </mds-table-cell>
          </mds-table-row>
        </mds-table-body>
      </mds-table>
    </div>
  )
}

export const ConcurrentSlotNames = {
  render: Template,
}
