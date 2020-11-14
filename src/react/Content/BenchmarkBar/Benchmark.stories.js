import React from 'react'
import faker from 'faker'

import BenchmarkBar from '@Content/BenchmarkBar/BenchmarkBar'

faker.locale = 'it'

export default {
  title: 'Content/BenchmarkBar',
  component: BenchmarkBar,
}

export const basicUsage = () =>
  <BenchmarkBar perc={faker.random.number(100)}>
    { faker.lorem.sentence() }
  </BenchmarkBar>
