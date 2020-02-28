import React from 'react'
import faker from 'faker'

import Textarea from './Textarea'
faker.locale = 'it'

export default {
  title: 'Policy App/Form/Textarea',
  component: Textarea,
}

export const basicUsage = () =>
  <Textarea label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()}></Textarea>

export const noLabel = () =>
  <Textarea placeholder={faker.company.catchPhrase()}></Textarea>

export const customIcon = () =>
  <Textarea label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()} icon="operator"></Textarea>
