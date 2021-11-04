import React, { Fragment } from 'react'
import faker from 'faker'
import MdsTable from '@component/mds-table/mds-table'

export default {
  title: 'Layout / Table',
  component: MdsTable,
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
      <mds-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-table-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.sentence() }</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.sentence() }</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.paragraph() }</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.sentence() }</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.sentence() }</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.paragraph() }</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.sentence() }</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.sentence() }</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.paragraph() }</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.sentence() }</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.sentence() }</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-52"><mds-text typography="detail">{ faker.lorem.paragraph() }</mds-text></mds-table-cell>
      </mds-table-row>
    </mds-table-body>
    <mds-table-footer>
    <mds-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">{ faker.lorem.word() }</mds-text></mds-table-cell>
    </mds-table-footer>
  </mds-table>

export const Default = Template.bind({})
