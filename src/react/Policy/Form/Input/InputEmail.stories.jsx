import React from 'react'
import faker from 'faker'
faker.locale = 'it'

import InputEmail from './InputEmail'

export default {
  title: 'Policy App/Form/Email',
  component: InputEmail,
}

export const basicUsage = () =>
  <InputEmail placeholder={faker.internet.exampleEmail()}/>
