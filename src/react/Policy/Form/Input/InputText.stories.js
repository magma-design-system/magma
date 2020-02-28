import React from 'react'
import faker from 'faker'

import InputText from './InputText'
faker.locale = 'it'

export default {
  title: 'Policy App/Form/Text',
  component: InputText,
}

export const basicUsage = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()}/>

export const noLabel = () =>
  <InputText placeholder={faker.company.catchPhrase()}/>

export const customIcon = () =>
  <InputText placeholder={faker.phone.phoneNumber()} icon="operator"/>
