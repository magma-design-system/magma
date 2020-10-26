import React from 'react'
import faker from 'faker'

import InputEmail from '@Form/Input/InputEmail'
import InputList, { InputListItem } from '@Form/Input/InputList'
import InputPassword from '@Form/Input/InputPassword'
import InputPhone from '@Form/Input/InputPhone'
import InputText from '@Form/Input/InputText'
import randomIcon from '@Design/Icon/faker'
faker.locale = 'it'

export default {
  title: 'Form/Text',
  component: InputText,
}

export const basicUsage = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()}/>

export const noLabel = () =>
  <InputText placeholder={faker.company.catchPhrase()}/>

export const customIcon = () =>
  <InputText placeholder="Inserisci qualcosa a caso..." icon={randomIcon()}/>

export const Phone = () =>
  <InputPhone label="This is a text field" placeholder={faker.company.catchPhrase()}/>

export const Password = () =>
  <InputPassword label="This is a text field" placeholder={faker.company.catchPhrase()}/>

export const Email = () =>
  <InputEmail label={faker.lorem.sentence()} placeholder={faker.internet.exampleEmail()}/>

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
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()} icon={randomIcon()} error={faker.lorem.sentence()}/>
