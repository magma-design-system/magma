import React from 'react'
import faker from 'faker'

import InputPassword from '@Form/Input/InputPassword'
faker.locale = 'it'

export default {
  title: 'Form/Password',
  component: InputPassword,
}

export const basicUsage = () =>
  <InputPassword label="This is a text field" placeholder={faker.company.catchPhrase()}/>
