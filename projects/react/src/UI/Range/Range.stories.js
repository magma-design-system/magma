import React from 'react'
import faker from 'faker'

import Range from '@UI/Range/Range'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'UI/Range',
  component: Range,
}

export const basicUsage = () =>
  <Grid gutter="small">
    <Range/>
  </Grid>
