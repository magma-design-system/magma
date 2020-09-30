import React from 'react'
import faker from 'faker'

import InputText from '@Backend/Form/Input/InputText'

faker.locale = 'it'

export default {
  title: 'Backend/Form/Text',
  component: InputText,
}

export const basicUsage = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()}/>

export const customIcon = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.phone.phoneNumber()} icon="operator"/>

export const noPlaceholder = () =>
  <InputText label={faker.lorem.sentence()} icon="operator"/>

export const fieldFilled = () =>
  <InputText value="Filled content" label={faker.lorem.sentence()} placeholder={faker.phone.phoneNumber()} icon="operator"/>
