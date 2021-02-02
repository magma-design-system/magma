import React from 'react'
import faker from 'faker'

import Radio from '@UI/Radio/Radio'
import Grid from '@Layout/Grid/Grid'
import randomIcon from '@Design/Icon/faker'
faker.locale = 'it'

export default {
  title: 'UI/Radio',
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
    <Radio name="radioGroupName" value="1" icon={randomIcon()}>
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2" icon={randomIcon()}>
      {faker.lorem.sentences()}
    </Radio>
  </Grid>

export const customColor = () =>
  <Grid gutter="small">
    <Radio name="radioGroupName" value="1" icon={randomIcon()} iconClassName="color-status-warning">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2" icon={randomIcon()} iconClassName="color-status-error">
      {faker.lorem.sentences()}
    </Radio>
  </Grid>
