import React, { Fragment } from 'react'
import faker from 'faker'
import MdsTable from '@component/mds-table/mds-table'

export default {
  title: 'Layout / Table',
  component: MdsTable,
}

const Template = () =>
  <mds-table>
    <mds-table-header>
        <mds-table-cell typography="action">{ faker.lorem.word() }</mds-table-cell>
        <mds-table-cell typography="action">{ faker.lorem.word() }</mds-table-cell>
        <mds-table-cell typography="action">{ faker.lorem.word() }</mds-table-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell className="min-w-52">{ faker.lorem.sentence() }</mds-table-cell>
        <mds-table-cell className="min-w-52">{ faker.lorem.sentence() }</mds-table-cell>
        <mds-table-cell className="min-w-52">{ faker.lorem.paragraph() }</mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell className="min-w-52">{ faker.lorem.sentence() }</mds-table-cell>
        <mds-table-cell className="min-w-52">{ faker.lorem.sentence() }</mds-table-cell>
        <mds-table-cell className="min-w-52">{ faker.lorem.paragraph() }</mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell className="min-w-52">{ faker.lorem.sentence() }</mds-table-cell>
        <mds-table-cell className="min-w-52">{ faker.lorem.sentence() }</mds-table-cell>
        <mds-table-cell className="min-w-52">{ faker.lorem.paragraph() }</mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell className="min-w-52">{ faker.lorem.sentence() }</mds-table-cell>
        <mds-table-cell className="min-w-52">{ faker.lorem.sentence() }</mds-table-cell>
        <mds-table-cell className="min-w-52">{ faker.lorem.paragraph() }</mds-table-cell>
      </mds-table-row>
    </mds-table-body>
    <mds-table-footer>
        <mds-table-cell typography="action">{ faker.lorem.word() }</mds-table-cell>
        <mds-table-cell typography="action">{ faker.lorem.word() }</mds-table-cell>
        <mds-table-cell typography="action">{ faker.lorem.word() }</mds-table-cell>
    </mds-table-footer>
  </mds-table>

export const Default = Template.bind({})
