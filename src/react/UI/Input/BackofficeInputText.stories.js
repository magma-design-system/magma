import React from 'react'
import faker from 'faker'

import InputText from '@UI/Input/BackofficeInputText'
import InputList, { BackofficeInputListItem as InputListItem } from '@UI/Input/BackofficeInputList'
import InputPassword from '@UI/Input/BackofficeInputPassword'
import InputEmail from '@UI/Input/BackofficeInputEmail'

faker.locale = 'it'

export default {
  title: 'UI/BackofficeInputText',
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

export const Email = () =>
  <InputEmail label="Email" placeholder="Insert e-mail address..."/>

export const Password = () =>
  <InputPassword label="Password" placeholder="Insert password..."/>

const cities = new Array(50)
  .fill(null)
  .map(() =>
    faker.address.city(),
  ).sort()

export const List = () =>
  <InputList label="Città" placeholder="Inerisci il nome di una città...">
    {cities.map((city, index) =>
      <InputListItem key={index} value={city}/>,
    )}
  </InputList>

export const Error = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()} error={faker.lorem.sentence()}/>
