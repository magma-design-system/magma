import React from 'react'
import faker from 'faker'

import Radio from './Radio'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'Form/Radio',
  component: Radio,
}

export const basicUsage = () =>
  <Grid gutter="small">
    <Radio name="radioGroupName" value="1">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2">
      {faker.lorem.sentences()}
    </Radio>
  </Grid>

export const checkedByDefault = () =>
  <Grid gutter="small">
    <Radio name="radioGroupName" value="1">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2" isChecked={true}>
      {faker.lorem.sentences()}
    </Radio>
  </Grid>

export const customIcon = () =>
  <Grid gutter="small">
    <Radio name="radioGroupName" value="1" icon="warning">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2" icon="error">
      {faker.lorem.sentences()}
    </Radio>
  </Grid>

export const customColor = () =>
  <Grid gutter="small">
    <Radio name="radioGroupName" value="1" icon="warning" iconClassName="color-red-2">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2" icon="error" iconClassName="color-red-2">
      {faker.lorem.sentences()}
    </Radio>
  </Grid>
