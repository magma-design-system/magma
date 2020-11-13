import React, { useState } from 'react'
import faker from 'faker'

import BackofficeSelect, { BackofficeSelectOption } from '@UI/Select/BackofficeSelect'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'UI/BackofficeSelect',
  component: BackofficeSelect,
}

export const basicUsage = () =>
  <Grid template="auto-fill-large">
    <BackofficeSelect icon="data-view" label={faker.lorem.words()}>
      <BackofficeSelectOption value="1">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="2">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="3">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="4">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="5">{faker.lorem.word()}</BackofficeSelectOption>
    </BackofficeSelect>
  </Grid>

export const noIcon = () =>
  <Grid template="auto-fill-large">
    <BackofficeSelect label={faker.lorem.words()}>
      <BackofficeSelectOption value="1">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="2">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="3">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="4">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="5">{faker.lorem.word()}</BackofficeSelectOption>
    </BackofficeSelect>
  </Grid>

export const dataDrivenOptions = () => {
  const data = ['Roma', 'Forlì', 'Milano', 'Firenze']
  const [value, setValue] = useState('Milano')
  return <Grid template="auto-fill-large">
    <BackofficeSelect icon="map-city" data={data} value={value} label={faker.lorem.words()} onChange={e => setValue(e.target.value)} />
  </Grid>
}
