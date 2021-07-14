import React, { Fragment } from 'react'
import faker from 'faker'
import MdsGrid from '@component/mds-grid/mds-grid'

export default {
  title: 'Layout / Grid',
  component: MdsGrid,
}

const Contents = () =>
  <Fragment>
    <mds-card class="gap-2 bg-label-amaranth-18 shadow-none">
      <mds-text>{faker.lorem.paragraph()}</mds-text>
      <mds-text>{faker.lorem.paragraph()}</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-yellow-18 shadow-none">
      <mds-text>{faker.lorem.paragraph()}</mds-text>
      <mds-text>{faker.lorem.paragraph()}</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-green-18 shadow-none">
      <mds-text>{faker.lorem.paragraph()}</mds-text>
      <mds-text>{faker.lorem.paragraph()}</mds-text>
    </mds-card>
  </Fragment>

export const Default = () =>
  <mds-grid class="gap-4 grid-cols-fit-md">
    <Contents />
  </mds-grid>
