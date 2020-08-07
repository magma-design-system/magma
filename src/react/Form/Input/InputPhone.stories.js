import React from 'react'
import faker from 'faker'

import InputPhone from '@Form/Input/InputPhone'
faker.locale = 'it'

export default {
  title: 'Form/Phone',
  component: InputPhone,
}

export const basicUsage = () =>
  <InputPhone label="This is a text field" placeholder={faker.company.catchPhrase()}/>

export const customIcon = () =>
  <InputPhone icon="smartphone" placeholder={faker.phone.phoneNumber()}/>
