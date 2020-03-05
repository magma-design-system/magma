import React, { useState } from 'react'
import faker from 'faker'

import Checkbox from './Checkbox'
import Grid from '@Layout/Grid/Grid'
faker.locale = 'it'

export default {
  title: 'Form/Checkbox',
  component: Checkbox,
}

export const basicUsage = () =>
  <Checkbox>
    {faker.lorem.sentences()}
  </Checkbox>

export const checkedByDefault = () =>
  <Checkbox isChecked={true}>
    {faker.lorem.sentences()}
  </Checkbox>

export const customIcon = () =>
  <Checkbox icon="license">
    {faker.lorem.sentences()}
  </Checkbox>

export const customColor = () =>
  <Checkbox iconClassName="color-red-2">
    {faker.lorem.sentences()}
  </Checkbox>

const checkboxText1 = faker.lorem.sentence()
const checkboxText2 = faker.lorem.sentence()

const SyncCheckboxes = props => {
  const [isCheckboxActive, activateCheckbox] = useState(false)
  return (
    <Grid gutter="small">
      <Checkbox sync={true} isChecked={isCheckboxActive} onChange={isChecked => { activateCheckbox(isChecked) }}>{checkboxText1}</Checkbox>
      <Checkbox sync={true} isChecked={isCheckboxActive} onChange={isChecked => { activateCheckbox(isChecked) }}>{checkboxText2}</Checkbox>
    </Grid>
  )
}

export const syncMultipleCheckboxes = () =>
  <SyncCheckboxes/>
