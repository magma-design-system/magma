import React from 'react'
import faker from 'faker'
import MdsH1 from '../../../dist/collection/components/mds-h1/mds-h1'

export default {
  title: 'Typography / H1',
  component: MdsH1,
}

export const Default = args =>
  <mds-h1 {...args}>
    {faker.lorem.paragraph()}
  </mds-h1>
