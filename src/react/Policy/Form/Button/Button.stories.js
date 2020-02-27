import React from 'react'
import faker from 'faker'
faker.locale = 'it'

import Button from './Button'

export default {
  title: 'Policy App/Form/Button',
  component: Button,
}

export const basicUsage = () =>
  <Button>{faker.hacker.verb()}</Button>

export const withIcon = () =>
  <Button icon="email">{faker.hacker.verb()}</Button>

export const disabled = () =>
  <Button icon="email" disabled={true}>{faker.hacker.verb()}</Button>
