import React, { Fragment } from 'react'
import faker from 'faker'
import MdsRow from '@component/mds-row/mds-row'

export default {
  title: 'Layout / Row',
  component: MdsRow,
}

export const Default = () =>
  <mds-row>
    <mds-card class="gap-2 bg-label-amaranth-18 shadow-none">
      <mds-text>{faker.lorem.sentence()}</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-yellow-18 shadow-none">
      <mds-text>{faker.lorem.sentence()}</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-green-18 shadow-none">
      <mds-text>{faker.lorem.sentence()}</mds-text>
    </mds-card>
  </mds-row>

export const Wrap = () =>
  <mds-row class="flex-wrap tablet:flex-nowrap">
    <mds-card class="flex-grow gap-2 bg-label-amaranth-18 shadow-none">
      <mds-text>{faker.lorem.sentence(10)}</mds-text>
    </mds-card>
    <mds-card class="flex-grow gap-2 bg-label-yellow-18 shadow-none">
      <mds-text>{faker.lorem.sentence(3)}</mds-text>
    </mds-card>
    <mds-card class="flex-grow gap-2 bg-label-green-18 shadow-none">
      <mds-text>{faker.lorem.sentence(3)}</mds-text>
    </mds-card>
  </mds-row>

export const Grow = () =>
  <mds-row>
    <mds-card class="flex-grow gap-2 bg-label-amaranth-18 shadow-none">
      <mds-text>{faker.lorem.sentence()}</mds-text>
    </mds-card>
    <mds-card class="gap-2 bg-label-green-18 shadow-none">
      <mds-text>{faker.lorem.sentence()}</mds-text>
    </mds-card>
  </mds-row>
