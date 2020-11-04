import React from 'react'
import faker from 'faker'

import Select, { SelectOption } from '@UI/Select/Select'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'UI/Select',
  component: Select,
}

export const basicUsage = () =>
  <Grid gutter="small">
    <Select>
      <SelectOption value="1">{faker.lorem.word()}</SelectOption>
      <SelectOption value="2">{faker.lorem.word()}</SelectOption>
      <SelectOption value="3">{faker.lorem.word()}</SelectOption>
      <SelectOption value="4">{faker.lorem.word()}</SelectOption>
      <SelectOption value="5">{faker.lorem.word()}</SelectOption>
    </Select>
  </Grid>
