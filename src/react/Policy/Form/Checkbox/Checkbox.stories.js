import React, { Fragment, useState } from 'react'
import faker from 'faker'
faker.locale = 'it'

import Checkbox from './Checkbox'

export default {
  title: 'Policy App/Form/Checkbox',
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
    <Fragment>
      <Checkbox sync={true} isChecked={isCheckboxActive} onChange={isChecked => { activateCheckbox(isChecked) }}>{checkboxText1}</Checkbox>
      <Checkbox sync={true} isChecked={isCheckboxActive} onChange={isChecked => { activateCheckbox(isChecked) }}>{checkboxText2}</Checkbox>
    </Fragment>
  )
}

export const syncMoreCheckboxes = () =>
  <SyncCheckboxes/>
