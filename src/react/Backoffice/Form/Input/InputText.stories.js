import React from 'react'
import faker from 'faker'

import InputText from '@Backoffice/Form/Input/InputText'
import InputList, { InputListItem } from '@Backoffice/Form/Input/InputList'
import InputPassword from '@Backoffice/Form/Input/InputPassword'
import InputEmail from '@Backoffice/Form/Input/InputEmail'

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
      <InputListItem value={city}/>,
    )}
  </InputList>

export const Error = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()} error={faker.lorem.sentence()}/>
