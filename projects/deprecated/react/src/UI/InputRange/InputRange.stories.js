import React from 'react'
import faker from 'faker'

import Grid from '@Layout/Grid/Grid'
import InputRange from '@UI/InputRange/InputRange'
faker.locale = 'it'

export default {
  title: 'UI/InputRange',
  component: InputRange,
}

export const basicUsage = () =>
  <Grid className="gap-0">
    <InputRange label="Imposta numero di elementi" value={100} step={100} min={100} max={6000}/>
  </Grid>
