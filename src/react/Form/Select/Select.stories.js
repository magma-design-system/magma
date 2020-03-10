import React from 'react'
import faker from 'faker'

import Select from './Select'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'Form/Select',
  component: Select,
}

export const basicUsage = () =>
  <Grid gutter="small">
    <Select>
      <option value="1">{faker.lorem.word()}</option>
      <option value="2">{faker.lorem.word()}</option>
      <option value="3">{faker.lorem.word()}</option>
      <option value="4">{faker.lorem.word()}</option>
      <option value="5">{faker.lorem.word()}</option>
    </Select>
  </Grid>
