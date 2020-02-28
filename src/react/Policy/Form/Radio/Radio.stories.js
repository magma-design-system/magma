import React, { Fragment } from 'react'
import faker from 'faker'

import Radio from './Radio'
faker.locale = 'it'

export default {
  title: 'Policy App/Form/Radio',
  component: Radio,
}

export const basicUsage = () =>
  <Fragment>
    <Radio name="radioGroupName" value="1">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2">
      {faker.lorem.sentences()}
    </Radio>
  </Fragment>

export const checkedByDefault = () =>
  <Fragment>
    <Radio name="radioGroupName" value="1">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2" isChecked={true}>
      {faker.lorem.sentences()}
    </Radio>
  </Fragment>

export const customIcon = () =>
  <Fragment>
    <Radio name="radioGroupName" value="1" icon="warning">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2" icon="error">
      {faker.lorem.sentences()}
    </Radio>
  </Fragment>

export const customColor = () =>
  <Fragment>
    <Radio name="radioGroupName" value="1" icon="warning" iconClassName="color-red-2">
      {faker.lorem.sentences()}
    </Radio>
    <Radio name="radioGroupName" value="2" icon="error" iconClassName="color-red-2">
      {faker.lorem.sentences()}
    </Radio>
  </Fragment>
