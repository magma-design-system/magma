import React from 'react'
import faker from 'faker'

import InputEmail from './InputEmail'
faker.locale = 'it'

export default {
  title: 'Policy App/Form/Email',
  component: InputEmail,
}

export const basicUsage = () =>
  <InputEmail label={faker.lorem.sentence()} placeholder={faker.internet.exampleEmail()}/>
