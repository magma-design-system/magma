import React from 'react'
import faker from 'faker'

import Range from './Range'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'Form/Range',
  component: Range,
}

export const basicUsage = () =>
  <Grid gutter="small">
    <Range/>
  </Grid>
