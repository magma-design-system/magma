import React from 'react'
import faker from 'faker'

import BackofficeSelect, { BackofficeSelectOption } from '@UI/Select/BackofficeSelect'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'UI/BackofficeSelect',
  component: BackofficeSelect,
}

export const basicUsage = () =>
  <Grid gutter="small">
    <BackofficeSelect label="Prova">
      <BackofficeSelectOption value="1">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="2">{2}</BackofficeSelectOption>
      <BackofficeSelectOption value="3">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="4">{faker.lorem.word()}</BackofficeSelectOption>
      <BackofficeSelectOption value="5">{faker.lorem.word()}</BackofficeSelectOption>
    </BackofficeSelect>
  </Grid>
