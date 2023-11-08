import React from 'react'
import faker from 'faker'

import Switch from '@UI/Switch/Switch'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'UI/Switch',
  component: Switch,
}

export const basicUsage = () =>
  <Grid gutter="small">
    <Switch>{faker.lorem.sentences()}</Switch>
  </Grid>

export const activeByDefault = () =>
  <Grid gutter="small">
    <Switch sChecked={true}>{faker.lorem.sentences()}</Switch>
  </Grid>

export const themedColor = () =>
  <Grid gutter="small">
    <Switch sChecked={true} boxClassName="background-color-status-warning">{faker.lorem.sentences()}</Switch>
  </Grid>
