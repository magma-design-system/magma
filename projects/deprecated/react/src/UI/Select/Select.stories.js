import React, { useState } from 'react'
import faker from 'faker'

import Select, { SelectOption } from '@UI/Select/Select'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'UI/Select',
  component: Select,
}

export const basicUsage = () =>
  <Grid template="auto-fill-medium">
    <Select>
      <SelectOption value="1">{faker.lorem.word()}</SelectOption>
      <SelectOption value="2">{faker.lorem.word()}</SelectOption>
      <SelectOption value="3">{faker.lorem.word()}</SelectOption>
      <SelectOption value="4">{faker.lorem.word()}</SelectOption>
      <SelectOption value="5">{faker.lorem.word()}</SelectOption>
    </Select>
  </Grid>

export const dataDrivenOptions = () => {
  const data = ['Roma', 'Forlì', 'Milano', 'Firenze']
  const [value, setValue] = useState('Milano')
  return <Grid template="auto-fill-medium">
    <Select icon="map-city" data={data} value={value} label={faker.lorem.words()} onChange={e => setValue(e.target.value)} />
  </Grid>
}
