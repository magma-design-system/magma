import React from 'react'
import faker from 'faker'

import InputEmail from '@Form/Input/InputEmail'
faker.locale = 'it'

export default {
  title: 'Form/Email',
  component: InputEmail,
}

export const basicUsage = () =>
  <InputEmail label={faker.lorem.sentence()} placeholder={faker.internet.exampleEmail()}/>
