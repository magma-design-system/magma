import React, { useState } from 'react'
import faker from 'faker'

import Checkbox from '@UI/Checkbox/Checkbox'
import Grid from '@Layout/Grid/Grid'
import randomIcon from '@Design/Icon/faker'
faker.locale = 'it'

export default {
  title: 'UI/Checkbox',
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
  <Checkbox icon={randomIcon()}>
    {faker.lorem.sentences()}
  </Checkbox>

export const customColor = () =>
  <Checkbox iconClassName="color-status-error-08">
    {faker.lorem.sentences()}
  </Checkbox>

const checkboxText1 = faker.lorem.sentence()
const checkboxText2 = faker.lorem.sentence()

const SyncCheckboxes = () => {
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
